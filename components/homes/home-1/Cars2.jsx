"use client";
import Slider from "react-slick";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getBadgeColor, getRandomBadges } from "@/lib/carBadges";
import { getCarDetailHref } from "@/lib/carPaths";
import {
  getInventoryApiHeaders,
  INVENTORY_API_ROOT,
  normalizeInventoryImageUrl,
} from "@/lib/inventoryApi";
import PriceWithInfo from "@/components/common/PriceWithInfo";

const API_URL = `${INVENTORY_API_ROOT}/cars`;
const FALLBACK_IMAGE = "/images/car.webp";
const POPULAR_CARS_LIMIT = 9;
const VARIANT_SLIDER_SETTINGS = {
  arrows: true,
  dots: false,
  infinite: false,
  slidesToShow: 1,
  slidesToScroll: 1,
  adaptiveHeight: true,
  speed: 400,
  swipeToSlide: true,
};

const CATEGORY_LABELS = [
  "Cars",
  "SUV / Off-road vehicles",
  "Luxury / Premium",
];
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
const formatEngine = (engine) => (engine ? `${engine} cc` : "-");
const formatFuel = (value, t) => {
  const label = FUEL_LABELS[value] || value || "-";
  return t ? t(label) : label;
};
const formatTransmission = (value, t) => {
  const label = TRANSMISSION_LABELS[value] || value || "-";
  return t ? t(label) : label;
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
  const year = car.year_of_manufacture ?? car.manufactureYear;
  if (year) {
    parts.push(`${year}`);
  }
  const seats = car.seats_number ?? car.seatCapacity;
  if (seats) {
    parts.push(t("{count} seats", { count: seats }));
  }
  const doors = car.door_number ?? car.doorCount;
  if (doors) {
    parts.push(t("{count} doors", { count: doors }));
  }
  const color = car.color_item ?? car.colorItem;
  if (color) {
    parts.push(`${color}`);
  }
  return parts.join(" - ");
};
const normalizePrice = (price) => {
  const parsed = Number(price);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 50;
};
const deriveCategories = (car) => {
  const rawType = [
    car.category,
    car.category_name,
    car.vehicle_type,
    car.vehicleType,
    car.body_type,
    car.bodyType,
    car.segment,
    car.type,
    car.class,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (!rawType) {
    return CATEGORY_LABELS;
  }
  const categories = new Set();
  if (
    rawType.includes("suv") ||
    rawType.includes("off-road") ||
    rawType.includes("off road") ||
    rawType.includes("4x4") ||
    rawType.includes("crossover")
  ) {
    categories.add("SUV / Off-road vehicles");
  }
  if (
    rawType.includes("lux") ||
    rawType.includes("premium") ||
    rawType.includes("executive")
  ) {
    categories.add("Luxury / Premium");
  }
  if (
    rawType.includes("car") ||
    rawType.includes("sedan") ||
    rawType.includes("hatch") ||
    rawType.includes("coupe") ||
    rawType.includes("convertible") ||
    rawType.includes("wagon")
  ) {
    categories.add("Cars");
  }
  return categories.size ? Array.from(categories) : CATEGORY_LABELS;
};
export default function Cars2() {
  const [cars, setCars] = useState([]);
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
    let isCurrent = true;
    const fetchCars = async () => {
      try {
        const res = await fetch(API_URL, {
          headers: getInventoryApiHeaders(),
        });
        const payload = await res.json();
        const data = Array.isArray(payload?.data) ? payload.data : [];
        const mappedCars = data
          .slice(0, POPULAR_CARS_LIMIT)
          .map((car, index) => {
          const rawPrice =
            car.price_per_day ?? car.price ?? car.pricePerDay ?? 0;
          const priceValue = normalizePrice(rawPrice);
          const imageUrl = Array.isArray(car.images)
            ? car.images.find((image) => image?.path)?.path
            : null;
          const rawMainImage =
            imageUrl || car.image || car.image_url || FALLBACK_IMAGE;
          const mainImage = normalizeInventoryImageUrl(
            rawMainImage,
            FALLBACK_IMAGE
          );
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
                const normalizedInstanceImage = normalizeInventoryImageUrl(
                  instanceImageUrl,
                  mainImage
                );
                return {
                  uuid: instance.uuid,
                  image: normalizedInstanceImage,
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
            images: [mainImage],
            badges,
            title: car.vehicle_name || car.name || car.alias || t("Vehicle"),
            description:
              buildDescription(car, t) ||
              t("Vehicle details are not available."),
            specs: [
              { icon: "flaticon-gasoline-pump", text: formatEngine(car.engine) },
              {
                icon: "flaticon-speedometer",
                text: formatFuel(
                  car.fuel_type || car.engine_type || car.fuelType,
                  t
                ),
              },
              {
                icon: "flaticon-gearbox",
                text: formatTransmission(
                  car.transmission_type || car.transmissionType,
                  t
                ),
              },
            ],
            oldPrice: "",
            priceValue,
            variants,
            brand: deriveCategories(car),
          };
        });

        if (!isCurrent) {
          return;
        }
        setCars(mappedCars);
      } catch (error) {
        if (isCurrent) {
          console.error(t("Error loading cars:"), error);
          setCars([]);
        }
      }
    };
    fetchCars();
    return () => {
      isCurrent = false;
    };
  }, [t]);

  const slickOptions = {
    infinite: false,
    slidesToShow: 2.3,
    // initialSlide: -0.3,
    slidesToScroll: 1,
    dots: false,
    arrows: true,
    responsive: [
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ],
  };
  const displayedCars = cars;
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

  const renderVariantCard = (variant, index) => {
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
    const imageSrc = variant.image || expandedCar.images?.[0] || FALLBACK_IMAGE;
    const imageAlt = `${expandedCar.title || t("Variant")} ${index + 1}`;
    return (
      <Link
        key={variant.uuid || `${expandedCar.id}-${variant.index}`}
        href={{
          pathname: `/car/${expandedCar.id}`,
          query: { instance: variant.uuid },
        }}
        className={`variant-card${isBase ? " is-base" : " is-upgrade"}`}
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
              <li key={`${variant.index}-diff-${itemIndex}`}>{item}</li>
            ))}
          </ul>
          <div className="variant-footer">
            <span className="variant-cta">{t("Details")}</span>
          </div>
        </div>
      </Link>
    );
  };
  const variantSliderSettings = {
    ...VARIANT_SLIDER_SETTINGS,
    arrows: orderedVariants.length > 1,
  };

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
    <section className="cars-section-two">
      <div className="boxcar-container">
        <div className="boxcar-title light wow fadeInUp">
          <h2>{t("Popular picks")}</h2>
          <Link href={`/cars`} className="btn-title">
            {t("View all")}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={14}
              height={14}
              viewBox="0 0 14 14"
              fill="none"
            >
              <g clipPath="url(#clip0_601_675)">
                <path
                  d="M13.6109 0H5.05533C4.84037 0 4.66643 0.173943 4.66643 0.388901C4.66643 0.603859 4.84037 0.777802 5.05533 0.777802H12.6721L0.113697 13.3362C-0.0382246 13.4881 -0.0382246 13.7342 0.113697 13.8861C0.18964 13.962 0.289171 14 0.388666 14C0.488161 14 0.587656 13.962 0.663635 13.8861L13.222 1.3277V8.94447C13.222 9.15943 13.3959 9.33337 13.6109 9.33337C13.8259 9.33337 13.9998 9.15943 13.9998 8.94447V0.388901C13.9998 0.173943 13.8258 0 13.6109 0Z"
                  fill="white"
                />
              </g>
              <defs>
                <clipPath id="clip0_601_675">
                  <rect width={14} height={14} fill="white" />
                </clipPath>
              </defs>
            </svg>
          </Link>
        </div>
      </div>
      <div className="tab-content wow fadeInUp" data-wow-delay="200ms">
        <div className="tab-pane fade show active">
          <div
            className={`home-slider-area${
              hasExpandedVariants ? " has-variants-open" : ""
            }`}
            ref={sliderAreaRef}
          >
            <Slider
              {...slickOptions}
              className="row car-slider slider-layout-1"
              data-preview="2.3"
            >
              {displayedCars.map((car, index) => {
                const variantCount = Array.isArray(car.variants)
                  ? car.variants.length
                  : 0;
                const hasVariants = variantCount > 1;
                const isExpanded = expandedId === car.id;
                const detailsLabel = hasVariants
                  ? t("Variants")
                  : t("View Details");
                const variantsId = `home-variants-${car.id}`;
                return (
                  <div
                    key={car.id ?? index}
                    className={`car-block-two col-lg-4 col-md-6 col-sm-12${
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
                            aria-expanded={
                              hasVariants ? isExpanded : undefined
                            }
                            aria-controls={
                              hasVariants ? variantsId : undefined
                            }
                          >
                            <Image
                              alt={car.title}
                              src={car.images[0]}
                              width={320}
                              height={320}
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
                        <a href="#" className="icon-box">
                          <svg
                            width={12}
                            height={12}
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clipPath="url(#clip0_2806_1274)">
                              <path
                                d="M9.39062 12C9.15156 12 8.91671 11.9312 8.71128 11.8009L6.11794 10.1543C6.04701 10.1091 5.95296 10.1096 5.88256 10.1543L3.28869 11.8009C2.8048 12.1082 2.13755 12.0368 1.72722 11.6454C1.47556 11.4047 1.33685 11.079 1.33685 10.728V1.2704C1.33738 0.570053 1.90743 0 2.60778 0H9.39272C10.0931 0 10.6631 0.570053 10.6631 1.2704V10.728C10.6631 11.4294 10.0925 12 9.39062 12ZM6.00025 9.06935C6.24193 9.06935 6.47783 9.13765 6.68169 9.26743L9.27503 10.9135C9.31233 10.9371 9.35069 10.9487 9.39114 10.9487C9.48046 10.9487 9.61286 10.8788 9.61286 10.728V1.2704C9.61233 1.14956 9.51356 1.05079 9.39272 1.05079H2.60778C2.48642 1.05079 2.38817 1.14956 2.38817 1.2704V10.728C2.38817 10.7911 2.41023 10.8436 2.45384 10.8851C2.52582 10.9539 2.63563 10.9708 2.72599 10.9135L5.31934 9.2669C5.52267 9.13765 5.75857 9.06935 6.00025 9.06935Z"
                                fill="black"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_2806_1274">
                                <rect width={12} height={12} fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                        </a>
                      </div>
                      <div className="content-box">
                        <h6 className="title">
                          <Link
                            href={getCarDetailHref(car)}
                            onClick={(event) =>
                              handleCardClick(event, car.id, hasVariants)
                            }
                            aria-expanded={
                              hasVariants ? isExpanded : undefined
                            }
                            aria-controls={
                              hasVariants ? variantsId : undefined
                            }
                          >
                            {car.title}
                          </Link>
                        </h6>
                        <div className="text">{t(car.description)}</div>
                        <ul>
                          {car.specs.map((spec, specIndex) => (
                            <li key={specIndex}>
                              <i className={spec.icon} />
                              {t(spec.text)}
                            </li>
                          ))}
                        </ul>
                        <div className="btn-box">
                          {car.oldPrice ? <span>{car.oldPrice}</span> : null}
                          <small>
                            <PriceWithInfo value={car.priceValue} fallback={50} />
                          </small>
                            <Link
                              href={getCarDetailHref(car)}
                            className="details variant-button"
                            onClick={(event) =>
                              handleCardClick(event, car.id, hasVariants)
                            }
                            aria-expanded={
                              hasVariants ? isExpanded : undefined
                            }
                            aria-controls={
                              hasVariants ? variantsId : undefined
                            }
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
            {hasExpandedVariants && expandedCar && (
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
                    {orderedVariants.map(renderVariantCard)}
                  </div>
                  <div className="variant-items-slider">
                    <Slider {...variantSliderSettings}>
                      {orderedVariants.map(renderVariantCard)}
                    </Slider>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
