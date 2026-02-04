"use client";
import Link from "@/components/common/LocalizedLink";
import Slider from "react-slick";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getBadgeColor, getRandomBadges } from "@/lib/carBadges";
import { getCarDetailHref } from "@/lib/carPaths";
import { getInventoryApiHeaders, INVENTORY_API_ROOT } from "@/lib/inventoryApi";
import PriceWithInfo from "@/components/common/PriceWithInfo";

const API_URL = `${INVENTORY_API_ROOT}/cars`;
const FALLBACK_IMAGE = "/images/car.webp";
const HOME_CARS_LIMIT = 9;

const FUEL_LABELS = {
  D: "Diesel",
  B: "Petrol",
  P: "Petrol",
  E: "Electric",
  H: "Hybrid",
  G: "Gas",
};
const TRANSMISSION_LABELS = {
  A: "Automatic",
  M: "Manual",
};
const EQUIPMENT_KEY_LABELS = {
  abs: "ABS",
  asr: "ASR",
  roof: "Roof",
  "roof-type": "Roof",
  "panoramic-roof": "Panoramic roof",
  "rear-camera": "Rear camera",
  "parking-sensors": "Parking sensors",
  "parking-sensor": "Parking sensors",
  navigation: "Navigation",
  "air-condition": "Air conditioning",
  "lane-assist": "Lane assist",
  "adaptive-cruise": "Adaptive cruise control",
  "premium-sound": "Premium audio",
  "leather-seats": "Leather seats",
  "wind-deflector": "Wind deflector",
  "sport-seats": "Sport seats",
  "dark-windows": "Tinted windows",
  "ambient-lighting": "Ambient lighting",
  "blind-spot": "Blind spot",
};
const EQUIPMENT_VALUE_LABELS = {
  cabrio: "Convertible",
  panoramic: "Panoramic",
  premium: "Premium",
  sport: "Sport",
};
const normalizeEquipmentKey = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .trim();
const humanizeEquipment = (value) => {
  const cleaned = String(value).replace(/[_-]+/g, " ").trim();
  if (!cleaned) {
    return "";
  }
  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
};
const formatEngine = (engine) => (engine ? `${engine} cc` : "—");
const formatFuel = (value, t) => {
  const label = FUEL_LABELS[value] || value || "—";
  return t ? t(label) : label;
};
const formatTransmission = (value, t) => {
  const label = TRANSMISSION_LABELS[value] || value || "—";
  return t ? t(label) : label;
};
const formatEquipmentLabel = (key, value, t) => {
  const normalizedKey = normalizeEquipmentKey(key);
  const rawKeyLabel =
    EQUIPMENT_KEY_LABELS[normalizedKey] || humanizeEquipment(normalizedKey);
  const keyLabel = t ? t(rawKeyLabel) : rawKeyLabel;
  if (
    value === true ||
    value === false ||
    value === "true" ||
    value === "false" ||
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return keyLabel;
  }
  const normalizedValue = normalizeEquipmentKey(value);
  const rawValueLabel =
    EQUIPMENT_VALUE_LABELS[normalizedValue] || humanizeEquipment(value);
  const valueLabel = t ? t(rawValueLabel) : rawValueLabel;
  if (normalizedKey.includes("roof")) {
    return `${valueLabel} ${keyLabel}`;
  }
  return `${keyLabel}: ${valueLabel}`;
};
const formatAdditionalEquipmentBadges = (equipment, t) => {
  if (!equipment) {
    return [];
  }
  if (Array.isArray(equipment)) {
    return equipment.map((item) =>
      String(item).replace(/-/g, " ").trim()
    );
  }
  if (typeof equipment === "object") {
    return Object.entries(equipment).map(
      ([key, value]) => formatEquipmentLabel(key, value, t)
    );
  }
  return [String(equipment).replace(/-/g, " ").trim()];
};
const buildDescription = (car, t) => {
  const parts = [];
  if (car.manufactureYear) {
    parts.push(`${car.manufactureYear}`);
  }
  if (car.seatCapacity) {
    parts.push(t("{count} seats", { count: car.seatCapacity }));
  }
  if (car.doorCount) {
    parts.push(t("{count} doors", { count: car.doorCount }));
  }
  if (car.colorItem) {
    parts.push(`${car.colorItem}`);
  }
  return parts.join(" · ");
};
export default function Cars() {
  const [sortedItems, setSortedItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const sliderAreaRef = useRef(null);
  const variantPanelRef = useRef(null);
  const { t } = useLanguage();

  const toggleExpanded = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };
  const handleCardClick = (event, id, hasVariants) => {
    if (!hasVariants) {
      return;
    }
    event.preventDefault();
    toggleExpanded(id);
  };

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await fetch(API_URL, {
          headers: getInventoryApiHeaders(),
        });
        const payload = await res.json();
        const data = Array.isArray(payload?.data) ? payload.data : [];

        const mappedCars = data.slice(0, HOME_CARS_LIMIT).map((car, index) => {
          const rawPrice =
            car.price_per_day ?? car.price ?? car.pricePerDay ?? 0;
          const priceValue = Number.isFinite(Number(rawPrice))
            ? Number(rawPrice)
            : 0;
          const imageUrl = Array.isArray(car.images)
            ? car.images.find((image) => image?.path)?.path
            : null;
          const mainImage =
            imageUrl || car.image || car.image_url || FALLBACK_IMAGE;
          const rawInstances = car.instances || car.carInstances;
          const variants = Array.isArray(rawInstances)
            ? rawInstances.map((instance) => {
                const instanceImageUrl =
                  (Array.isArray(instance.images)
                    ? instance.images.find((image) => image?.path)?.path
                    : null) ||
                  instance.image ||
                  instance.image_url ||
                  mainImage;
                return {
                  uuid: instance.uuid,
                  image: instanceImageUrl,
                  additionalEquipmentBadges: formatAdditionalEquipmentBadges(
                    instance.additional_equipment ?? instance.additionalEquipment,
                    t
                  ),
                };
              })
            : [];
          const badgeSeed = car.id ?? index + 1;
          const badges = getRandomBadges(badgeSeed, 2);
          return {
            id: car.id ?? index + 1,
            alias: car.alias,
            title: car.name || car.alias,
            description:
              buildDescription(car, t) || t("Vehicle details are not available."),
            priceValue,
            oldPrice: "",
            badges,
            images: [mainImage],
            filterCategories: ["Special offers"],
            variants,
            specs: [
              { icon: "fas fa-gas-pump", text: formatEngine(car.engine) },
              {
                icon: "fas fa-tachometer-alt",
                text: formatFuel(car.fuelType, t),
              },
              {
                icon: "fas fa-cogs",
                text: formatTransmission(car.transmissionType, t),
              },
            ],
          };
        });

        setSortedItems(mappedCars);
      } catch (error) {
        console.error(t("Error loading cars:"), error);
      }
    };

    fetchCars();
  }, [t]);


  const options = {
    infinite: false,
    slidesToShow: 5,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      { breakpoint: 1600, settings: { slidesToShow: 4, slidesToScroll: 1, infinite: true } },
      { breakpoint: 1300, settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true } },
      { breakpoint: 991, settings: { slidesToShow: 2, slidesToScroll: 1, infinite: true } },
      { breakpoint: 767, settings: { slidesToShow: 1, slidesToScroll: 1 } },
      { breakpoint: 576, settings: { slidesToShow: 1, slidesToScroll: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  // Filter by category (placeholder for future logic)
  const displayedCars = sortedItems;
  const expandedCar = displayedCars.find((car) => car.id === expandedId);
  const hasExpandedVariants =
    expandedCar && Array.isArray(expandedCar.variants)
      ? expandedCar.variants.length > 1
      : false;
  const normalizedVariants = expandedCar
    ? expandedCar.variants.map((variant, index) => ({
        ...variant,
        equipment: Array.isArray(variant.additionalEquipmentBadges)
          ? variant.additionalEquipmentBadges.filter(Boolean)
          : [],
        index,
      }))
    : [];
  const baseVariantIndex = normalizedVariants.length
    ? normalizedVariants.findIndex(
        (variant) => variant.equipment.length === 0
      )
    : -1;
  const resolvedBaseIndex = baseVariantIndex >= 0 ? baseVariantIndex : 0;
  const baseVariant = normalizedVariants[resolvedBaseIndex] || null;
  const orderedVariants = baseVariant
    ? [
        baseVariant,
        ...normalizedVariants.filter(
          (_, index) => index !== resolvedBaseIndex
        ),
      ]
    : [];
  const baseEquipmentSet = new Set(baseVariant?.equipment || []);
  const basePriceValue =
    expandedCar && Number.isFinite(expandedCar.priceValue)
      ? expandedCar.priceValue
      : 0;
  const showPrice = basePriceValue > 0;
  useEffect(() => {
    const container = sliderAreaRef.current;
    if (!container) {
      return;
    }
    const panelHeight =
      hasExpandedVariants && variantPanelRef.current
        ? variantPanelRef.current.offsetHeight
        : 0;
    container.style.setProperty(
      "--home-variants-height",
      `${panelHeight}px`
    );
  }, [hasExpandedVariants, expandedId, orderedVariants.length]);

  useEffect(() => {
    const handleResize = () => {
      const container = sliderAreaRef.current;
      if (!container) {
        return;
      }
      const panelHeight =
        hasExpandedVariants && variantPanelRef.current
          ? variantPanelRef.current.offsetHeight
          : 0;
      container.style.setProperty(
        "--home-variants-height",
        `${panelHeight}px`
      );
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [hasExpandedVariants]);

  return (
    <section className="cars-section-three">
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp">
          <h2>{t("Recommended")}</h2>
          <Link href={`/cars`} className="btn-title">
            {t("View all")}
          </Link>
        </div>
      </div>

      
      <div className="tab-content wow fadeInUp" data-wow-delay="200ms">
        <div
          className={`home-slider-area${
            hasExpandedVariants ? " has-variants-open" : ""
          }`}
          ref={sliderAreaRef}
        >
          <Slider {...options} className="row car-slider-three slider-layout-1">
            {displayedCars.map((car) => {
              const variantCount = car.variants ? car.variants.length : 0;
              const hasVariants = variantCount > 1;
              const isExpanded = expandedId === car.id;
              const detailsLabel = hasVariants ? t("Variants") : t("More");
              const variantsId = `home-variants-${car.id}`;
              return (
                <div
                  key={car.id}
                  className={`box-car car-block-three col-lg-3 col-md-6 col-sm-12${
                    isExpanded ? " is-expanded" : ""
                  }`}
                >
                  <div className="inner-box">
                    <div className="image-box">
                      <figure className="image">
                        <Link
                          href={getCarDetailHref(car)}
                          onClick={(event) =>
                            handleCardClick(event, car.id, hasVariants)
                          }
                          aria-expanded={hasVariants ? isExpanded : undefined}
                          aria-controls={hasVariants ? variantsId : undefined}
                        >
                          <Image
                            alt={car.title}
                            src={car.images[0]}
                            width={329}
                            height={220}
                          />
                        </Link>
                      </figure>
                      {car.badges?.length ? (
                        <div className="car-badges">
                          {car.badges.map((badge, badgeIndex) => (
                            <span
                              key={`${car.id}-${badge.key}-${badgeIndex}`}
                              className="car-badge"
                              style={{
                                backgroundColor: getBadgeColor(badge.color),
                              }}
                            >
                              <i className={badge.icon} aria-hidden="true" />
                              {t(badge.label)}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="content-box">
                      <h6 className="title">
                        <Link
                          href={getCarDetailHref(car)}
                          onClick={(event) =>
                            handleCardClick(event, car.id, hasVariants)
                          }
                          aria-expanded={hasVariants ? isExpanded : undefined}
                          aria-controls={hasVariants ? variantsId : undefined}
                        >
                          {car.title}
                        </Link>
                      </h6>
                      <div className="text two-line-ellipsis">
                        {car.description}
                      </div>

                      <ul>
                        {car.specs.map((spec, i) => (
                          <li key={i}>
                            <i className={spec.icon} /> {spec.text}
                          </li>
                        ))}
                    </ul>
                    <div className="btn-box">
                      <span className={hasVariants ? "price-placeholder" : ""}>
                        <PriceWithInfo value={car.priceValue} fallback={50} />
                      </span>
                      <small>{car.oldPrice}</small>
                          <Link
                            href={getCarDetailHref(car)}
                          className="details variant-button"
                          onClick={(event) =>
                            handleCardClick(event, car.id, hasVariants)
                          }
                          aria-expanded={hasVariants ? isExpanded : undefined}
                          aria-controls={hasVariants ? variantsId : undefined}
                        >
                          {hasVariants ? (
                            <span className="variant-toggle">
                              <span className="variant-toggle-count">
                                {variantCount}
                              </span>
                              <span className="variant-toggle-label">
                                {detailsLabel}
                              </span>
                              <span className="variant-toggle-symbol">
                                {isExpanded ? "-" : "+"}
                              </span>
                            </span>
                          ) : (
                            detailsLabel
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
          {hasExpandedVariants && (
            <div
              id={`home-variants-${expandedCar.id}`}
              className="boxcar-container home-variants-wrap"
              ref={variantPanelRef}
            >
              <div className="variant-panel home-variant-panel">
                <div className="variant-title">
                  <span>
                    {t("Variants for")} {expandedCar.title}
                  </span>
                </div>
                <div className="variant-items">
                  {orderedVariants.map((variant, index) => {
                    const isBase = index === 0;
                    const equipment = variant.equipment || [];
                    const differenceItems = equipment.filter(
                      (item) => !baseEquipmentSet.has(item)
                    );
                    const visibleDifferences = isBase
                      ? [t("Standard equipment")]
                      : differenceItems.length
                        ? differenceItems
                        : [t("Additional equipment not listed")];
                    const priceStep = 5;
                    const variantPriceValue =
                      showPrice && !isBase
                        ? basePriceValue + differenceItems.length * priceStep
                        : basePriceValue;
                    const priceLabel = showPrice ? variantPriceValue : 50;
                    const imageSrc =
                      variant.image ||
                      expandedCar.images?.[0] ||
                      FALLBACK_IMAGE;
                    const imageAlt = `${expandedCar.title || t("Variant")} ${
                      index + 1
                    }`;
                    return (
                      <Link
                        key={
                          variant.uuid || `${expandedCar.id}-${variant.index}`
                        }
                        href={{
                          pathname: `/car/${expandedCar.id}`,
                          query: { instance: variant.uuid },
                        }}
                        className={`variant-card${
                          isBase ? " is-base" : " is-upgrade"
                        }`}
                        aria-selected={isBase ? "true" : "false"}
                      >
                        <div className="variant-card-media">
                          <Image
                            src={imageSrc}
                            alt={imageAlt}
                            fill
                            sizes="(max-width: 767px) 100vw, 200px"
                            className="variant-card-image"
                          />
                        </div>
                        <div className="variant-card-body">
                          <div className="variant-price">
                            <PriceWithInfo value={priceLabel} fallback={50} />
                          </div>
                          <div className="variant-diff-label">
                            {isBase ? t("Standard") : t("Includes additional")}
                          </div>
                          <ul className="variant-diffs">
                            {visibleDifferences.map((item, itemIndex) => (
                              <li
                                key={`${variant.index}-diff-${itemIndex}`}
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                          <div className="variant-footer">
                            <span className="variant-cta">
                              {t("Details")}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
