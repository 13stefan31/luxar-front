"use client";
import React, { useEffect, useMemo, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import SelectComponent from "../common/SelectComponent";
import Link from "@/components/common/LocalizedLink";
import { useLanguage } from "@/context/LanguageContext";
import { useCarFilters } from "./useCarFilters";
import { getBadgeColor, getRandomBadges } from "@/lib/carBadges";
import { getCarDetailHref } from "@/lib/carPaths";
import {
  getInventoryApiHeaders,
  INVENTORY_API_ROOT,
  normalizeInventoryImageUrl,
} from "@/lib/inventoryApi";
import PriceWithInfo from "@/components/common/PriceWithInfo";

const pad2 = (value) => String(value).padStart(2, "0");
const normalizeTimeTo24h = (value) => {
  if (!value) {
    return "";
  }
  const raw = String(value).trim();
  if (!raw) {
    return "";
  }
  const ampmMatch = raw.match(
    /^\s*(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])\s*$/
  );
  if (ampmMatch) {
    let hours = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2] ?? "0");
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return raw;
    }
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return raw;
    }
    const isPm = ampmMatch[3].toLowerCase() === "pm";
    if (hours === 12) {
      hours = isPm ? 12 : 0;
    } else if (isPm) {
      hours += 12;
    }
    return `${pad2(hours)}:${pad2(minutes)}`;
  }
  const timeMatch = raw.match(/^\s*(\d{1,2})(?::(\d{2}))?/);
  if (!timeMatch) {
    return raw;
  }
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2] ?? "0");
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return raw;
  }
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return raw;
  }
  return `${pad2(hours)}:${pad2(minutes)}`;
};
const splitDateTime = (value) => {
  if (!value) {
    return { date: "", time: "" };
  }
  const raw = String(value).trim();
  if (!raw) {
    return { date: "", time: "" };
  }
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](.+))?$/);
  if (!match) {
    return { date: raw, time: "" };
  }
  const date = match[1] || "";
  const time = normalizeTimeTo24h(match[2] || "");
  return { date, time };
};
const formatRequestDateTime = (value) => {
  const { date, time } = splitDateTime(value);
  if (!date || !time) {
    return "";
  }
  return `${date} ${time}`;
};
const toLocalInputDate = (date) => {
  const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - tzOffsetMs);
  return localDate.toISOString().slice(0, 10);
};
const getTodayInputDate = () => toLocalInputDate(new Date());
const clampDateToMin = (value, minDate) => {
  if (!value) {
    return "";
  }
  return value < minDate ? minDate : value;
};
const resolveMinDropoffDate = (pickupDate, today) =>
  pickupDate && pickupDate >= today ? pickupDate : today;

const API_URL = `${INVENTORY_API_ROOT}/cars`;
const FALLBACK_IMAGE = "/images/car.webp";
const DEFAULT_TIME = "12:00";
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
const formatAdditionalEquipment = (equipment, t) => {
  const badges = formatAdditionalEquipmentBadges(equipment, t);
  return badges.length ? badges.join(", ") : t("No additional equipment");
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
  return parts.join(" · ");
};
const mapCars = (items, pageToLoad, perPage, t) => {
  const safePerPage = perPage || items.length || 1;
  return items.map((car, index) => {
    const title = car.vehicle_name || car.name || car.alias || t("Vehicle");
    const description = buildDescription(car, t);
    const imageUrl = Array.isArray(car.images)
      ? car.images.find((image) => image?.path)?.path
      : null;
    const rawImage = imageUrl || car.image || car.image_url || FALLBACK_IMAGE;
    const imgSrc = normalizeInventoryImageUrl(rawImage, FALLBACK_IMAGE);
    const rawInstances = car.carInstances || car.instances;
    const variants = Array.isArray(rawInstances)
      ? rawInstances.map((instance) => {
          const instanceImageUrl =
            (Array.isArray(instance.images)
              ? instance.images.find((image) => image?.path)?.path
              : null) ||
            instance.image ||
            instance.image_url ||
            imgSrc;
          const normalizedInstanceImage = normalizeInventoryImageUrl(
            instanceImageUrl,
            imgSrc
          );
          return {
            uuid: instance.uuid,
            image: normalizedInstanceImage,
            additionalEquipment: formatAdditionalEquipment(
              instance.additional_equipment ?? instance.additionalEquipment,
              t
            ),
            additionalEquipmentBadges: formatAdditionalEquipmentBadges(
              instance.additional_equipment ?? instance.additionalEquipment,
              t
            ),
          };
        })
      : [];
    const rawPrice =
      car.price_per_day ?? car.price ?? car.pricePerDay;
    const parsedPrice =
      rawPrice === null || rawPrice === undefined
        ? null
        : typeof rawPrice === "string" && rawPrice.trim() === ""
          ? null
          : Number(rawPrice);
    const priceValue = Number.isFinite(parsedPrice) ? parsedPrice : null;
    const badgeSeed = car.id ?? `${pageToLoad}-${index}`;
    const badges = getRandomBadges(badgeSeed, 2);
    return {
      id: car.id ?? `${pageToLoad}-${index}`,
      alias: car.alias,
      imgSrc,
      alt: title,
      title,
      description: description || t("Vehicle details are not available."),
      mileage: formatEngine(car.engine),
      fuel: formatFuel(car.fuel_type || car.engine_type || car.fuelType, t),
      transmission: formatTransmission(
        car.transmission_type || car.transmissionType,
        t
      ),
      priceValue,
      discountPriceValue: 0,
      badges,
      imgBoxClass: "image-box",
      btnDetails: t("Details"),
      variants,
    };
  });
};

export default function Cars() {
  const [carItems, setCarItems] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({
    totalPages: 1,
    currentPage: 1,
    perPage: 0,
    totalItems: null,
  });
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [columnsPerRow, setColumnsPerRow] = useState(3);
  const { t } = useLanguage();
  const { filters, setFilters } = useCarFilters();
  const [draftFilters, setDraftFilters] = useState(filters);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState(DEFAULT_TIME);
  const [dropoffDate, setDropoffDate] = useState("");
  const [dropoffTime, setDropoffTime] = useState(DEFAULT_TIME);
  const today = useMemo(() => getTodayInputDate(), []);
  const minDropoffDate = useMemo(
    () => resolveMinDropoffDate(pickupDate, today),
    [pickupDate, today]
  );
  const {
    engineType,
    transmissionType,
    fuelType,
    manufactureYear,
    minPrice,
    maxPrice,
    startingDate,
    endingDate,
  } = filters;
  const {
    engineType: draftEngineType,
    transmissionType: draftTransmissionType,
    fuelType: draftFuelType,
    manufactureYear: draftManufactureYear,
    minPrice: draftMinPrice,
    maxPrice: draftMaxPrice,
  } = draftFilters;
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

  const engineTypeOptions = useMemo(
    () => [
      { value: "", label: t("All") },
      { value: "D", label: t("Diesel") },
      { value: "P", label: t("Petrol") },
      { value: "H", label: t("Hybrid") },
      { value: "E", label: t("Electric") },
      { value: "G", label: t("Gas") },
    ],
    [t]
  );
  const transmissionOptions = useMemo(
    () => [
      { value: "", label: t("All") },
      { value: "A", label: t("Automatic") },
      { value: "M", label: t("Manual") },
    ],
    [t]
  );
  const fuelOptions = useMemo(
    () => [
      { value: "", label: t("All") },
      { value: "D", label: t("Diesel") },
      { value: "P", label: t("Petrol") },
      { value: "H", label: t("Hybrid") },
      { value: "E", label: t("Electric") },
      { value: "G", label: t("Gas") },
    ],
    [t]
  );
  const filterKey = `${engineType}|${transmissionType}|${fuelType}|${manufactureYear}|${minPrice}|${maxPrice}|${startingDate}|${endingDate}`;
  useEffect(() => {
    setDraftFilters(filters);
    const nextPickup = splitDateTime(startingDate);
    const nextDropoff = splitDateTime(endingDate);
    const normalizedPickupDate = clampDateToMin(nextPickup.date, today);
    const nextMinDropoffDate = resolveMinDropoffDate(
      normalizedPickupDate,
      today
    );
    const normalizedDropoffDate = clampDateToMin(
      nextDropoff.date,
      nextMinDropoffDate
    );
    setPickupDate(normalizedPickupDate);
    setPickupTime(nextPickup.time || DEFAULT_TIME);
    setDropoffDate(normalizedDropoffDate);
    setDropoffTime(nextDropoff.time || DEFAULT_TIME);
  }, [filterKey, today]);
  const handleFilterChange = (key) => (value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handleYearChange = (event) => {
    setDraftFilters((prev) => ({
      ...prev,
      manufactureYear: event.target.value,
    }));
  };
  const handlePriceChange = (key) => (event) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };
  const handleApplyFilters = () => {
    const nextFilters = { ...draftFilters };
    const normalizedPickupDate = clampDateToMin(pickupDate, today);
    const nextMinDropoffDate = resolveMinDropoffDate(
      normalizedPickupDate,
      today
    );
    const normalizedDropoffDate = clampDateToMin(
      dropoffDate,
      nextMinDropoffDate
    );
    const normalizedPickupTime = normalizeTimeTo24h(pickupTime);
    const normalizedDropoffTime = normalizeTimeTo24h(dropoffTime);
    const nextStartingDate =
      normalizedPickupDate && normalizedPickupTime
        ? `${normalizedPickupDate} ${normalizedPickupTime}`
        : "";
    const nextEndingDate =
      normalizedDropoffDate && normalizedDropoffTime
        ? `${normalizedDropoffDate} ${normalizedDropoffTime}`
        : "";
    nextFilters.startingDate = nextStartingDate;
    nextFilters.endingDate = nextEndingDate;
    setFilters(nextFilters);
  };
  const handlePickupDateChange = (event) => {
    const nextValue = clampDateToMin(event.target.value, today);
    setPickupDate(nextValue);
    const nextMinDropoff = resolveMinDropoffDate(nextValue, today);
    if (dropoffDate && dropoffDate < nextMinDropoff) {
      setDropoffDate(nextMinDropoff);
    }
  };
  const handleDropoffDateChange = (event) => {
    const nextValue = clampDateToMin(event.target.value, minDropoffDate);
    setDropoffDate(nextValue);
  };

  useEffect(() => {
    const getColumnsPerRow = () => {
      if (typeof window === "undefined") {
        return 3;
      }
      if (window.innerWidth >= 992) {
        return 3;
      }
      if (window.innerWidth >= 768) {
        return 2;
      }
      return 1;
    };
    const handleResize = () => {
      setColumnsPerRow(getColumnsPerRow());
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    setPage(1);
    setCarItems([]);
    setExpandedId(null);
    setMeta({
      totalPages: 1,
      currentPage: 1,
      perPage: 0,
      totalItems: null,
    });
  }, [filterKey]);

  useEffect(() => {
    let isCurrent = true;

    const fetchCars = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("page", String(page));
        if (engineType) {
          queryParams.set("engineType", engineType);
        }
        if (transmissionType) {
          queryParams.set("transmissionType", transmissionType);
        }
        if (fuelType) {
          queryParams.set("fuelType", fuelType);
        }
        if (manufactureYear) {
          queryParams.set("manufactureYear", manufactureYear);
        }
        if (minPrice) {
          queryParams.set("minPrice", minPrice);
        }
        if (maxPrice) {
          queryParams.set("maxPrice", maxPrice);
        }
        const formattedStartingDate = formatRequestDateTime(startingDate);
        if (formattedStartingDate) {
          queryParams.set("startingDate", formattedStartingDate);
        }
        const formattedEndingDate = formatRequestDateTime(endingDate);
        if (formattedEndingDate) {
          queryParams.set("endingDate", formattedEndingDate);
        }
        const queryString = queryParams.toString().replace(/\+/g, "%20");
        const response = await fetch(`${API_URL}?${queryString}`, {
          headers: getInventoryApiHeaders(),
        });
        if (!response.ok) {
          throw new Error("Request failed");
        }
        const payload = await response.json();
        console.log("Cars API response:", payload);
        const items = Array.isArray(payload.data) ? payload.data : [];
        const perPage = payload.meta?.perPage || items.length || 1;
        const metaTotalItems = Number(payload.meta?.totalItems);
        const totalItems = Number.isFinite(metaTotalItems)
          ? metaTotalItems
          : items.length;
        const totalPages = payload.meta?.totalPages
          ? payload.meta.totalPages
          : totalItems && perPage
            ? Math.ceil(totalItems / perPage)
            : page;
        const mappedCars = mapCars(items, page, perPage, t);

        if (!isCurrent) {
          return;
        }

        setMeta({
          totalPages: totalPages || page,
          currentPage: page,
          perPage: perPage,
          totalItems,
        });
        setCarItems((prev) => {
          if (page === 1) {
            return mappedCars;
          }
          const existingIds = new Set(prev.map((item) => item.id));
          const nextItems = mappedCars.filter(
            (item) => !existingIds.has(item.id)
          );
          return [...prev, ...nextItems];
        });
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(t("Error loading vehicles."));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    fetchCars();
    return () => {
      isCurrent = false;
    };
  }, [
    page,
    t,
    engineType,
    transmissionType,
    fuelType,
    manufactureYear,
    minPrice,
    maxPrice,
    startingDate,
    endingDate,
  ]);

  const minPriceValue =
    minPrice !== "" && Number.isFinite(Number(minPrice))
      ? Number(minPrice)
      : null;
  const maxPriceValue =
    maxPrice !== "" && Number.isFinite(Number(maxPrice))
      ? Number(maxPrice)
      : null;
  const hasPriceFilter =
    minPriceValue !== null || maxPriceValue !== null;
  const filteredCars = carItems.filter((car) => {
    const hasPriceValue = Number.isFinite(car.priceValue);
    if (hasPriceFilter && !hasPriceValue) {
      return false;
    }
    if (minPriceValue !== null && car.priceValue < minPriceValue) {
      return false;
    }
    if (maxPriceValue !== null && car.priceValue > maxPriceValue) {
      return false;
    }
    return true;
  });
  const totalCount =
    hasPriceFilter
      ? filteredCars.length
      : Number.isFinite(meta.totalItems) && meta.totalItems >= 0
        ? meta.totalItems
        : meta.totalPages && meta.perPage
          ? meta.totalPages * meta.perPage
          : carItems.length;
  const showingText = totalCount
    ? t("Showing {shown} of {total} vehicles", {
        shown: filteredCars.length,
        total: totalCount,
      })
    : t("Showing {shown} vehicles", { shown: filteredCars.length });
  const canLoadMore = page < (meta.totalPages || page);
  const isInitialLoading = isLoading && carItems.length === 0;
  const safeColumnsPerRow = columnsPerRow || 1;
  const groupedCars = filteredCars.reduce((groups, car, index) => {
    if (index % safeColumnsPerRow === 0) {
      groups.push([]);
    }
    groups[groups.length - 1].push(car);
    return groups;
  }, []);

  const handleLoadMore = () => {
    if (isLoading || !canLoadMore) {
      return;
    }
    setPage((prev) => prev + 1);
  };

  return (
    <section className="cars-section-four v1 v2 layout-radius cars-section-white">
      <div className="boxcar-container">
        <div className="boxcar-title-three wow fadeInUp">
          <ul className="breadcrumb">
            <li>
              <Link href={`/`}>{t("Home")}</Link>
            </li>
            <li>
              <span>{t("Our vehicles")}</span>
            </li>
          </ul> 
        </div>
        <div className="row">
          <div className="wrap-sidebar-dk side-bar col-xl-3 col-md-12 col-sm-12 order-xl-2">
            <div className="sidebar-handle filter-popup">
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.75 4.50903C13.9446 4.50903 12.4263 5.80309 12.0762 7.50903H2.25C1.83579 7.50903 1.5 7.84482 1.5 8.25903C1.5 8.67324 1.83579 9.00903 2.25 9.00903H12.0762C12.4263 10.715 13.9446 12.009 15.75 12.009C17.5554 12.009 19.0737 10.715 19.4238 9.00903H21.75C22.1642 9.00903 22.5 8.67324 22.5 8.25903C22.5 7.84482 22.1642 7.50903 21.75 7.50903H19.4238C19.0737 5.80309 17.5554 4.50903 15.75 4.50903ZM15.75 6.00903C17.0015 6.00903 18 7.00753 18 8.25903C18 9.51054 17.0015 10.509 15.75 10.509C14.4985 10.509 13.5 9.51054 13.5 8.25903C13.5 7.00753 14.4985 6.00903 15.75 6.00903Z"
                  fill="#050B20"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M8.25 12.009C6.44461 12.009 4.92634 13.3031 4.57617 15.009H2.25C1.83579 15.009 1.5 15.3448 1.5 15.759C1.5 16.1732 1.83579 16.509 2.25 16.509H4.57617C4.92634 18.215 6.44461 19.509 8.25 19.509C10.0554 19.509 11.5737 18.215 11.9238 16.509H21.75C22.1642 16.509 22.5 16.1732 22.5 15.759C22.5 15.3448 22.1642 15.009 21.75 15.009H11.9238C11.5737 13.3031 10.0554 12.009 8.25 12.009ZM8.25 13.509C9.5015 13.509 10.5 14.5075 10.5 15.759C10.5 17.0105 9.5015 18.009 8.25 18.009C6.9985 18.009 6 17.0105 6 15.759C6 14.5075 6.9985 13.509 8.25 13.509Z"
                  fill="#050B20"
                />
              </svg>
              {t("Show filters")} 
            </div>
            <div className="inventory-sidebar">
              <div className="inventroy-widget widget-location">
                <div className="row">
                  <div className="col-lg-12">
                    <div className="price-box">
                      <div className="date-time-group-label">
                        {t("Pickup")}
                      </div>
                      <form
                        onSubmit={(event) => event.preventDefault()}
                        className="row g-0 date-time-row"
                      >
                        <div className="form-column col-6 col-lg-6">
                          <div className="form_boxes">
                            <label>{t("Pickup date")}</label>
                            <input
                              type="date"
                              value={pickupDate}
                              min={today}
                              onChange={handlePickupDateChange}
                              placeholder={t("Pickup date")}
                            />
                          </div>
                        </div>
                        <div className="form-column v2 col-6 col-lg-6">
                          <div className="form_boxes">
                            <label>{t("Pickup time")}</label>
                            <input
                              type="time"
                              value={pickupTime}
                              onChange={(event) =>
                                setPickupTime(event.target.value)
                              }
                              placeholder={t("Pickup time")}
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="price-box">
                      <div className="date-time-group-label">
                        {t("Return")}
                      </div>
                      <form
                        onSubmit={(event) => event.preventDefault()}
                        className="row g-0 date-time-row"
                      >
                        <div className="form-column col-6 col-lg-6">
                          <div className="form_boxes">
                            <label>{t("Drop-off date")}</label>
                            <input
                              type="date"
                              value={dropoffDate}
                              min={minDropoffDate}
                              onChange={handleDropoffDateChange}
                              placeholder={t("Drop-off date")}
                            />
                          </div>
                        </div>
                        <div className="form-column v2 col-6 col-lg-6">
                          <div className="form_boxes">
                            <label>{t("Drop-off time")}</label>
                            <input
                              type="time"
                              value={dropoffTime}
                              onChange={(event) =>
                                setDropoffTime(event.target.value)
                              }
                              placeholder={t("Drop-off time")}
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_boxes">
                      <label>{t("Engine Type")}</label>
                      <SelectComponent
                        options={engineTypeOptions}
                        value={draftEngineType}
                        onChange={handleFilterChange("engineType")}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_boxes">
                      <label>{t("Transmission")}</label>
                      <SelectComponent
                        options={transmissionOptions}
                        value={draftTransmissionType}
                        onChange={handleFilterChange("transmissionType")}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_boxes">
                      <label>{t("Fuel Type")}</label>
                      <SelectComponent
                        options={fuelOptions}
                        value={draftFuelType}
                        onChange={handleFilterChange("fuelType")}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="price-box">
                      <form
                        onSubmit={(event) => event.preventDefault()}
                        className="row g-0 date-time-row"
                      >
                        <div className="form-column col-6 col-lg-6">
                          <div className="form_boxes">
                            <label>{t("Min price")}</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={draftMinPrice}
                              onChange={handlePriceChange("minPrice")}
                              placeholder={t("Min price")}
                            />
                          </div>
                        </div>
                        <div className="form-column v2 col-6 col-lg-6">
                          <div className="form_boxes">
                            <label>{t("Max price")}</label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={draftMaxPrice}
                              onChange={handlePriceChange("maxPrice")}
                              placeholder={t("Max price")}
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_boxes">
                      <label>{t("Manufacture Year")}</label>
                      <input
                        type="number"
                        min="1900"
                        max="2100"
                        step="1"
                        value={draftManufactureYear}
                        onChange={handleYearChange}
                        placeholder={t("Manufacture Year")}
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form_boxes form-box-button">
                      <button
                        type="button"
                        className="theme-btn filter-apply-btn"
                        onClick={handleApplyFilters}
                      >
                        <i className="flaticon-search" />{" "}
                        {t("Search vehicles")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/*widget end*/}
            </div>
          </div>
          <div className="col-xl-9 col-md-12 col-sm-12 order-xl-1">
            <div className="text-box">
              <div className="text">
                {isInitialLoading ? t("Loading...") : showingText}
              </div>
            </div>
            <div className="listings-grid wow fadeInUp">
              {errorMessage && (
                <div className="row">
                  <div className="col-12">
                    <div className="text">{errorMessage}</div>
                  </div>
                </div>
              )}
              {!isInitialLoading && !errorMessage && filteredCars.length === 0 && (
                <div className="row">
                  <div className="col-12">
                    <div className="text">{t("No results.")}</div>
                  </div>
                </div>
              )}
              {groupedCars.map((group, groupIndex) => {
                const expandedCar = group.find((car) => car.id === expandedId);
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
                const resolvedBaseIndex =
                  baseVariantIndex >= 0 ? baseVariantIndex : 0;
                const baseVariant =
                  normalizedVariants[resolvedBaseIndex] || null;
                const orderedVariants = baseVariant
                  ? [
                      baseVariant,
                      ...normalizedVariants.filter(
                        (_, index) => index !== resolvedBaseIndex
                      ),
                    ]
                  : [];
                const baseEquipmentSet = new Set(
                  baseVariant?.equipment || []
                );
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
                        pathname: getCarDetailHref(expandedCar),
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
                        <div className="variant-diff-label">
                          {isBase
                            ? t("Standard")
                            : t("Includes additional")}
                        </div>
                        <ul className="variant-diffs">
                          {visibleDifferences.map((item, itemIndex) => (
                            <li key={`${variant.index}-diff-${itemIndex}`}>
                              {item}
                            </li>
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
                return (
                  <div
                    key={`group-${groupIndex}`}
                    className={`row variant-group${
                      expandedCar ? " has-expanded" : ""
                    }`}
                  >
                    {group.map((car) => {
                      const variantCount = car.variants
                        ? car.variants.length
                        : 0;
                      const hasVariants = variantCount > 1;
                      const isExpanded = expandedId === car.id;
                      const hasDiscount =
                        Number.isFinite(car.discountPriceValue) &&
                        car.discountPriceValue > 0 &&
                        car.discountPriceValue !== car.priceValue;
                      const currentPriceValue = hasDiscount
                        ? car.discountPriceValue
                        : car.priceValue;
                      const detailsLabel = hasVariants
                        ? t("Variants")
                        : car.btnDetails;
                      const variantsId = `variants-${car.id}`;
                      return (
                        <div
                          key={car.id}
                          className={`car-block-four variant-anchored col-lg-4 col-md-6 col-sm-12${
                            isExpanded ? " is-expanded" : ""
                          }`}
                        >
                          <div className="inner-box">
                            <div className={car.imgBoxClass}>
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
                                    alt={car.alt}
                                    src={car.imgSrc}
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
                                        backgroundColor: getBadgeColor(
                                          badge.color
                                        ),
                                      }}
                                    >
                                      <i
                                        className={badge.icon}
                                        aria-hidden="true"
                                      />
                                      {t(badge.label)}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <div className="content-box">
                              <div className="content-main">
                                <h6 className="title">
                                    <Link
                                      href={getCarDetailHref(car)}
                                    onClick={(event) =>
                                      handleCardClick(
                                        event,
                                        car.id,
                                        hasVariants
                                      )
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
                                <div className="text">{car.description}</div>
                                <ul>
                                  <li>
                                    <i className="flaticon-gasoline-pump" />{" "}
                                    {car.mileage}
                                  </li>
                                  <li>
                                    <i className="flaticon-speedometer" />{" "}
                                    {car.fuel}
                                  </li>
                                  <li>
                                    <i className="flaticon-gearbox" />{" "}
                                    {car.transmission}
                                  </li>
                                </ul>
                                <div className="btn-box">
                                  <div
                                    className={`price-wrap ${
                                      hasDiscount ? "has-discount" : ""
                                    }`}
                                  >
                                    <span className="current-price">
                                      {Number.isFinite(currentPriceValue) ? (
                                        <span className="price-prefix">
                                          {t("From")}
                                        </span>
                                      ) : null}
                                      <PriceWithInfo value={currentPriceValue} />
                                    </span>
                                    {hasDiscount && (
                                      <span className="original-price">
                                        <PriceWithInfo
                                          value={car.priceValue}
                                          showInfo={false}
                                        />
                                      </span>
                                    )}
                                  </div>
                                  <Link
                                    href={getCarDetailHref(car)}
                                    className="details variant-button"
                                    onClick={(event) =>
                                      handleCardClick(
                                        event,
                                        car.id,
                                        hasVariants
                                      )
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
                        </div>
                      );
                    })}
                    {expandedCar && (
                      <div
                        id={`variants-${expandedCar.id}`}
                        className="col-12 variant-row"
                      >
                        <div className="variant-panel">
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
                );
              })}
            </div>
            <div className="pagination-sec">
              <nav aria-label={t("Load more vehicles")}>
                {!isInitialLoading && canLoadMore && (
                  <ul className="pagination">
                    <li className="page-item">
                      <button
                        type="button"
                        className="page-link"
                        onClick={handleLoadMore}
                        disabled={isLoading}
                      >
                        {isLoading ? t("Loading...") : t("Load more")}
                      </button>
                    </li>
                  </ul>
                )}
                {!isInitialLoading && !canLoadMore && carItems.length > 0 && (
                  <div className="text">{t("No more results.")}</div>
                )}
                <div className="text">
                  {isInitialLoading ? t("Loading...") : showingText}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
