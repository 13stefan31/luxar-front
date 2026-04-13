"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Gallery, Item } from "react-photoswipe-gallery";
import Slider from "react-slick";
import { useSearchParams } from "next/navigation";
import Link from "@/components/common/LocalizedLink";
import { useLanguage } from "@/context/LanguageContext";
import { useFloatingAction } from "@/context/FloatingActionContext";
import {
  normalizeInventoryImageUrl,
  fetchCities,
  fetchReservationItems,
} from "@/lib/inventoryApi";
import CityAutocomplete from "@/components/common/CityAutocomplete";
import PhoneInput from "@/components/common/PhoneInput";
import RelatedCars from "./RelatedCars";
import Overview from "./sections/Overview";
import Description from "./sections/Description";

import TIME_OPTIONS from "@/lib/timeOptions";

const DEFAULT_TIME = "12:00";
const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const RETURN_GRACE_HOURS = 2;
const RETURN_GRACE_MS = RETURN_GRACE_HOURS * HOUR_IN_MS;

const toInputDate = (date) => {
  if (!(date instanceof Date)) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForMessage = (value) => {
  if (!value) {
    return "";
  }
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${day}.${month}.${year}`;
};

const normalizeTextValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
};

const pad2 = (value) => String(value).padStart(2, "0");

const normalizeTimeTo24h = (value) => {
  const raw = normalizeTextValue(value);
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
      return "";
    }
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return "";
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
    return "";
  }
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2] ?? "0");
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return "";
  }
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return "";
  }
  return `${pad2(hours)}:${pad2(minutes)}`;
};

const toInputDateFormat = (value) => {
  const raw = normalizeTextValue(value);
  if (!raw) {
    return "";
  }
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }
  const localMatch = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (localMatch) {
    return `${localMatch[3]}-${localMatch[2]}-${localMatch[1]}`;
  }
  return "";
};

const splitSearchDateTime = (value) => {
  const raw = normalizeTextValue(value);
  if (!raw) {
    return { date: "", time: "" };
  }
  const match = raw.match(/^([^ T]+)(?:[ T](.+))?$/);
  if (!match) {
    return { date: toInputDateFormat(raw), time: "" };
  }
  return {
    date: toInputDateFormat(match[1]),
    time: normalizeTimeTo24h(match[2] || ""),
  };
};

const clampDateToMin = (value, minDate) => {
  if (!value) {
    return "";
  }
  return value < minDate ? minDate : value;
};

const toApiDateTime = (date, time) => {
  const safeDate = normalizeTextValue(date);
  const safeTime = normalizeTextValue(time);
  if (!safeDate || !safeTime) {
    return "";
  }
  return `${safeDate} ${safeTime}`;
};

const parseDateTimeInput = (date, time) => {
  const safeDate = normalizeTextValue(date);
  const safeTime = normalizeTextValue(time);
  if (!safeDate || !safeTime) {
    return null;
  }
  const parsed = new Date(`${safeDate}T${safeTime}`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const formatDateTimeForApi = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  return `${toInputDate(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

const calculateRentalChargePolicy = (startDate, endDate) => {
  if (
    !(startDate instanceof Date) ||
    !(endDate instanceof Date) ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return null;
  }

  const durationMs = endDate.getTime() - startDate.getTime();
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return null;
  }

  const fullDays = Math.floor(durationMs / DAY_IN_MS);
  const remainderMs = durationMs - fullDays * DAY_IN_MS;
  const hasRemainder = remainderMs > 0;
  const withinGrace = hasRemainder && remainderMs <= RETURN_GRACE_MS;

  let chargeableDays = 1;
  if (fullDays > 0) {
    chargeableDays = !hasRemainder || withinGrace ? fullDays : fullDays + 1;
  }

  return {
    chargeableDays,
    billableEnd: new Date(startDate.getTime() + chargeableDays * DAY_IN_MS),
  };
};

const parseNumericValue = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().replace(/[^\d.,-]/g, "").replace(",", ".");
  if (!normalized) {
    return null;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const ERROR_MESSAGE_CODES = {
  "car_instance.not_found.by_code": "Vehicle not found.",
  "date_range.drop_off_before_pick_up":
    "Drop-off date must be after pick-up date.",
  "date_range.ending_before_starting":
    "End date must be after start date.",
  "date_range.starting_after_ending":
    "Start date must be before end date.",
  "vehicle.not_available.for_period":
    "This vehicle is not available for the selected period.",
  "vehicle.not_available.no_alternative":
    "No available vehicle found for the selected period.",
  "vehicle.already_booked":
    "This vehicle was just booked by someone else. Please try again.",
  "reservation.missing_name": "First name and last name are required.",
  "reservation.missing_email": "Email is required.",
  "reservation.missing_phone_number": "Phone number is required.",
  "reservation.negative_total_price": "Invalid price calculation.",
  "car_price.not_found.for_period":
    "No pricing available for the selected period.",
  "car_price.not_found.for_car":
    "No pricing configured for this vehicle.",
  "car_price.gap.non_contiguous_ranges":
    "Pricing is incomplete for the selected period.",
  "price_tier.not_found.for_duration":
    "No pricing available for this rental duration.",
  "validation.failed": "Please check the form and correct any errors.",
};

const VALIDATION_MESSAGES = {
  "reservation.phone_number.invalid": "Invalid phone number format.",
  "reservation.email.invalid": "Invalid email address.",
  "reservation.first_name.blank": "First name is required.",
  "reservation.last_name.blank": "Last name is required.",
  "reservation.email.blank": "Email is required.",
  "reservation.phone_number.blank": "Phone number is required.",
  "reservation.vehicle_code.blank": "Vehicle is required.",
  "reservation.pick_up_date.blank": "Pick-up date is required.",
  "reservation.drop_off_date.blank": "Drop-off date is required.",
  "reservation.pick_up_location.blank": "Pick-up location is required.",
  "reservation.drop_off_location.blank": "Drop-off location is required.",
  "reservation.pick_up_location.invalid": "Invalid pick-up location.",
  "reservation.drop_off_location.invalid": "Invalid drop-off location.",
  "reservation.pick_up_location_id.required": "Pick-up location is required.",
  "reservation.drop_off_location_id.required": "Drop-off location is required.",
  "reservation.language.invalid": "Invalid language.",
  "reservation.pick_up_date.must_be_future": "Pick-up date must be in the future.",
  "reservation.drop_off_date.must_be_after_pick_up": "Drop-off date must be after pick-up date.",
  "reservation.pick_up_date.invalid": "Invalid pick-up date.",
  "reservation.drop_off_date.invalid": "Invalid drop-off date.",
  "reservation.vehicle_code.invalid": "Invalid vehicle code.",
  "reservation.reservation_items.invalid": "Invalid reservation items.",
  "reservation.missing_name": "First name and last name are required.",
  "reservation.missing_email": "Email is required.",
  "reservation.missing_phone_number": "Phone number is required.",
  "reservation.negative_total_price": "Invalid price calculation.",
  "This value should not be blank.": "This field is required.",
  "This value is not valid.": "This value is not valid.",
  "This field is missing.": "This field is missing.",
};

const FIELD_NAME_MAP = {
  vehicleCode: "vehicleCode",
  carPickUpDateTime: "pickupDate",
  carDropOffDateTime: "dropoffDate",
  pickUpLocationId: "pickupLocation",
  dropOffLocationId: "dropoffLocation",
  pickUpAdditionalLocation: "pickUpAdditionalLocation",
  dropOffAdditionalLocation: "dropOffAdditionalLocation",
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  phoneNumber: "phoneNumber",
  language: "language",
  reservationItems: "reservationItems",
};

const parseValidationErrors = (payload) => {
  if (
    payload?.messageCode !== "validation.failed" ||
    !Array.isArray(payload?.parameters)
  ) {
    return null;
  }
  const errors = {};
  for (const param of payload.parameters) {
    const frontField = FIELD_NAME_MAP[param.field] || param.field;
    errors[frontField] =
      VALIDATION_MESSAGES[param.message] || param.message;
  }
  return Object.keys(errors).length ? errors : null;
};

const resolveApiError = (payload, t, fallback) => {
  const messageCode = payload?.messageCode;
  if (messageCode === "validation.failed") {
    return t(ERROR_MESSAGE_CODES["validation.failed"]);
  }
  if (messageCode && ERROR_MESSAGE_CODES[messageCode]) {
    return t(ERROR_MESSAGE_CODES[messageCode]);
  }
  return payload?.error || payload?.message || t(fallback);
};

const resolveCalculatedPrice = (payload) => {
  const candidates = [
    payload?.data?.price,
    payload?.data?.totalPrice,
    payload?.data?.total_price,
    payload?.data?.amount,
    payload?.data?.total,
    payload?.price,
    payload?.totalPrice,
    payload?.total_price,
    payload?.amount,
    payload?.total,
  ];
  for (const candidate of candidates) {
    const parsed = parseNumericValue(candidate);
    if (parsed !== null) {
      return parsed;
    }
  }
  return null;
};

const resolveCalculatedCurrency = (payload) => {
  const candidates = [
    payload?.data?.currency,
    payload?.data?.currencyCode,
    payload?.data?.currency_code,
    payload?.currency,
    payload?.currencyCode,
    payload?.currency_code,
  ];
  for (const candidate of candidates) {
    const normalized = normalizeTextValue(candidate);
    if (normalized) {
      return normalized.toUpperCase();
    }
  }
  return "EUR";
};

const formatCalculatedPrice = (amount, currency) => {
  const safeAmount = Number(amount);
  if (!Number.isFinite(safeAmount)) {
    return "";
  }
  const rounded =
    Math.abs(safeAmount % 1) < Number.EPSILON
      ? safeAmount.toFixed(0)
      : safeAmount.toFixed(2);
  const safeCurrency = normalizeTextValue(currency) || "EUR";
  return `${rounded} ${safeCurrency}`;
};

const resolveCarPriceCode = (carItem) => {
  const raw = carItem?.raw || {};
  const directCode = [
    raw.code,
    raw.priceCode,
    raw.price_code,
    raw.carPriceCode,
    raw.car_price_code,
  ]
    .map((value) => normalizeTextValue(value))
    .find(Boolean);
  if (directCode) {
    return directCode;
  }

  const selectedInstanceId = normalizeTextValue(carItem?.instanceUuid);
  const instanceSources = [];
  if (raw.instance && typeof raw.instance === "object") {
    instanceSources.push(raw.instance);
  }
  if (Array.isArray(raw.instances)) {
    instanceSources.push(...raw.instances);
  }
  if (Array.isArray(raw.carInstances)) {
    instanceSources.push(...raw.carInstances);
  }
  const matchedInstance = selectedInstanceId
    ? instanceSources.find((instance) => {
        const instanceUuid = normalizeTextValue(instance?.uuid);
        const instanceId = normalizeTextValue(instance?.id);
        return (
          instanceUuid === selectedInstanceId || instanceId === selectedInstanceId
        );
      })
    : instanceSources[0];

  if (matchedInstance) {
    const instanceCode = [
      matchedInstance?.code,
      matchedInstance?.priceCode,
      matchedInstance?.price_code,
      matchedInstance?.uuid,
      matchedInstance?.id,
    ]
      .map((value) => normalizeTextValue(value))
      .find(Boolean);
    if (instanceCode) {
      return instanceCode;
    }
  }

  return selectedInstanceId;
};

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "38267880066";

const CROSS_BORDER_POLICY_PARAGRAPHS = [
  "Cross-border travel is permitted only with prior notification and approval from the Rent a Car agency.",
  "Vehicles are allowed to travel to the following countries: Croatia, Serbia, Albania, Kosovo, Bosnia and Herzegovina, Italy, and Greece.",
  "The renter must inform the agency in advance of any intention to cross a border in order to obtain the necessary documentation and to calculate any applicable cross-border fees.",
  "Unauthorized border crossing constitutes a violation of the rental agreement.",
];

const RENTAL_CALCULATION_POLICY_PARAGRAPHS = [
  "The minimum rental charge is one full day (24 hours).",
  "Rentals within the same day are charged as one full day.",
  "A grace period of 2 hours is allowed for vehicle return.",
  "Delays exceeding 2 hours will result in an additional full rental day being charged.",
  "Example: If a vehicle is rented for 3 days and returned 3 hours late, the total charge will be 4 rental days.",
];

export default function Single1({ carItem }) {
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams?.toString() || "";
  const { setReserveAction } = useFloatingAction() || {};
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [dropoffTime, setDropoffTime] = useState("");
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [priceCheckStatus, setPriceCheckStatus] = useState("idle");
  const [priceCheckError, setPriceCheckError] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [calculatedCurrency, setCalculatedCurrency] = useState("EUR");
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [checkedRangeKey, setCheckedRangeKey] = useState("");
  const [cities, setCities] = useState([]);
  const [reservationItems, setReservationItems] = useState([]);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pickUpAdditionalLocation, setPickUpAdditionalLocation] = useState("");
  const [dropOffAdditionalLocation, setDropOffAdditionalLocation] = useState("");
  const [reservationStatus, setReservationStatus] = useState("idle");
  const [reservationError, setReservationError] = useState("");
  const [reservationCode, setReservationCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { t, locale } = useLanguage();
  const today = toInputDate(new Date());
  const minDropoffDate = pickupDate || today;
  const detail = carItem?.raw || {};
  const carPriceCode = resolveCarPriceCode(carItem);
  const currentDateTimeKey = [
    carPriceCode,
    pickupDate,
    pickupTime,
    dropoffDate,
    dropoffTime,
  ].join("|");
  const activePriceCheckRef = useRef({
    key: "",
    controller: null,
    seq: 0,
  });
  const latestRangeKeyRef = useRef(currentDateTimeKey);
  latestRangeKeyRef.current = currentDateTimeKey;
  const canReserve =
    priceCheckStatus === "success" && checkedRangeKey === currentDateTimeKey;
  const rentalChargePolicy = useMemo(() => {
    const start = parseDateTimeInput(pickupDate, pickupTime);
    const end = parseDateTimeInput(dropoffDate, dropoffTime);
    if (!start || !end) {
      return null;
    }
    return calculateRentalChargePolicy(start, end);
  }, [pickupDate, pickupTime, dropoffDate, dropoffTime]);
  const galleryImages = Array.isArray(carItem?.images)
    ? carItem.images
        .map((image) => normalizeInventoryImageUrl(image, ""))
        .filter(Boolean)
    : [];
  const sliderImages = galleryImages.length
    ? galleryImages
    : ["/images/car.webp"];
  const showThumbs = sliderImages.length > 1;
  const showArrows = sliderImages.length > 1;
  const thumbSlidesToShow = Math.min(6, sliderImages.length);
  const thumbSlidesMd = Math.min(5, sliderImages.length);
  const thumbSlidesSm = Math.min(4, sliderImages.length);
  const thumbSlidesXs = Math.min(3, sliderImages.length);
  const mainSliderRef = useRef(null);
  const thumbSliderRef = useRef(null);
  const [navMain, setNavMain] = useState(null);
  const [navThumbs, setNavThumbs] = useState(null);
  useEffect(() => {
    setNavMain(mainSliderRef.current);
    setNavThumbs(thumbSliderRef.current);
  }, []);
  useEffect(() => {
    fetchCities()
      .then(setCities)
      .catch(() => setCities([]));
    fetchReservationItems()
      .then(setReservationItems)
      .catch(() => setReservationItems([]));
  }, []);
  useEffect(() => {
    if (!searchParamsKey) {
      return;
    }
    const params = new URLSearchParams(searchParamsKey);
    const pickupParam = params.get("startingDate");
    const dropoffParam = params.get("endingDate");
    if (!pickupParam && !dropoffParam) {
      return;
    }
    const pickupFromSearch = splitSearchDateTime(pickupParam);
    const dropoffFromSearch = splitSearchDateTime(dropoffParam);
    const nextPickupDate = clampDateToMin(pickupFromSearch.date, today);
    const nextPickupTime =
      pickupFromSearch.time || (nextPickupDate ? DEFAULT_TIME : "");
    const nextMinDropoffDate = nextPickupDate || today;
    const nextDropoffDate = clampDateToMin(
      dropoffFromSearch.date,
      nextMinDropoffDate
    );
    const nextDropoffTime =
      dropoffFromSearch.time || (nextDropoffDate ? DEFAULT_TIME : "");

    if (nextPickupDate) {
      setPickupDate(nextPickupDate);
    }
    if (nextPickupTime) {
      setPickupTime(nextPickupTime);
    }
    if (nextDropoffDate) {
      setDropoffDate(nextDropoffDate);
    }
    if (nextDropoffTime) {
      setDropoffTime(nextDropoffTime);
    }
  }, [searchParamsKey, today]);
  const specs = Array.isArray(carItem?.specs) ? carItem.specs : [];

  const openReservationModal = useCallback(() => {
    setIsReservationModalOpen(true);
  }, []);

  const closeReservationModal = useCallback(() => {
    setIsReservationModalOpen(false);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 991px)");
    const handleChange = () => setIsMobile(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!setReserveAction) {
      return undefined;
    }
    const reserveLabel = carItem?.title
      ? `${t("Reserve a vehicle")} ${carItem.title}`
      : t("Reserve a vehicle");
    setReserveAction({
      label: reserveLabel,
      onClick: openReservationModal,
    });
    return () => setReserveAction(null);
  }, [carItem?.title, openReservationModal, setReserveAction, t]);

  useEffect(() => {
    if (!isReservationModalOpen) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeReservationModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.body.classList.add("reservation-modal-open");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      document.body.classList.remove("reservation-modal-open");
    };
  }, [closeReservationModal, isReservationModalOpen]);

  useEffect(() => {
    return () => {
      const active = activePriceCheckRef.current;
      if (active?.controller) {
        active.controller.abort();
        active.controller = null;
      }
    };
  }, []);

  useEffect(() => {
    const active = activePriceCheckRef.current;
    if (active?.controller) {
      active.controller.abort();
      active.controller = null;
    }
    if (active) {
      active.key = "";
    }
    setPriceCheckStatus("idle");
    setPriceCheckError("");
    setCalculatedPrice(null);
    setCalculatedCurrency("EUR");
    setPriceBreakdown(null);
    setCheckedRangeKey("");
  }, [pickupDate, pickupTime, dropoffDate, dropoffTime, carPriceCode, pickupLocation, dropoffLocation, selectedExtras]);

  const handlePriceCheck = useCallback(async () => {
    const startDateTime = toApiDateTime(pickupDate, pickupTime);

    if (!startDateTime) {
      setPriceCheckStatus("error");
      setPriceCheckError(
        t("Please choose pickup and drop-off date and time first.")
      );
      return;
    }

    const start = parseDateTimeInput(pickupDate, pickupTime);
    const end = parseDateTimeInput(dropoffDate, dropoffTime);
    if (!start || !end) {
      setPriceCheckStatus("error");
      setPriceCheckError(
        t("Please choose pickup and drop-off date and time first.")
      );
      return;
    }
    if (!(end > start)) {
      setPriceCheckStatus("error");
      setPriceCheckError(t("Drop-off must be after pickup."));
      return;
    }

    if (!carPriceCode) {
      setPriceCheckStatus("error");
      setPriceCheckError(t("Unable to calculate price for this vehicle right now."));
      return;
    }

    const billingPolicy = calculateRentalChargePolicy(start, end);
    const endDateTime = formatDateTimeForApi(billingPolicy?.billableEnd);
    if (!endDateTime) {
      setPriceCheckStatus("error");
      setPriceCheckError(t("Unable to calculate price for this vehicle right now."));
      return;
    }

    setPriceCheckStatus("loading");
    setPriceCheckError("");
    setCalculatedPrice(null);
    setCalculatedCurrency("EUR");
    setPriceBreakdown(null);
    setCheckedRangeKey("");

    const active = activePriceCheckRef.current;
    if (active?.controller) {
      active.controller.abort();
    }
    const controller = new AbortController();
    const requestSeq = (activePriceCheckRef.current.seq || 0) + 1;
    activePriceCheckRef.current.seq = requestSeq;
    activePriceCheckRef.current.controller = controller;
    activePriceCheckRef.current.key = currentDateTimeKey;

    try {
      const response = await fetch("/api/car-price/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          code: carPriceCode,
          startingDate: startDateTime,
          endingDate: endDateTime,
          pickUpLocationId:
            cities.find((c) => c.name === pickupLocation)?.id || null,
          dropOffLocationId:
            cities.find((c) => c.name === dropoffLocation)?.id || null,
          reservationItems: selectedExtras,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          resolveApiError(
            payload,
            t,
            "Unable to calculate price for this vehicle right now."
          )
        );
      }

      const resolvedPrice = resolveCalculatedPrice(payload);
      if (resolvedPrice === null) {
        throw new Error(t("Unable to calculate price for this vehicle right now."));
      }

      const currentActive = activePriceCheckRef.current;
      if (
        currentActive.seq !== requestSeq ||
        latestRangeKeyRef.current !== currentDateTimeKey
      ) {
        return;
      }
      setCalculatedPrice(resolvedPrice);
      setCalculatedCurrency(resolveCalculatedCurrency(payload));
      setPriceBreakdown({
        daysBasedPrice: payload?.data?.daysBasedPrice ?? null,
        reservationItemsPrices: payload?.data?.reservationItemsPrices ?? {},
      });
      setCheckedRangeKey(currentDateTimeKey);
      setPriceCheckStatus("success");
      setPriceCheckError("");
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
      const currentActive = activePriceCheckRef.current;
      if (
        currentActive.seq !== requestSeq ||
        latestRangeKeyRef.current !== currentDateTimeKey
      ) {
        return;
      }
      setPriceCheckStatus("error");
      setPriceCheckError(
        error?.message || t("Unable to calculate price for this vehicle right now.")
      );
    } finally {
      const currentActive = activePriceCheckRef.current;
      if (currentActive.seq === requestSeq) {
        currentActive.controller = null;
      }
    }
  }, [
    carPriceCode,
    cities,
    currentDateTimeKey,
    dropoffDate,
    dropoffLocation,
    dropoffTime,
    pickupDate,
    pickupLocation,
    pickupTime,
    selectedExtras,
    t,
  ]);

  const handleExtraToggle = (code) => {
    setSelectedExtras((prev) =>
      prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code]
    );
  };

  const handleReservationSubmit = async (event) => {
    event.preventDefault();

    if (!canReserve || calculatedPrice === null) {
      setPriceCheckStatus("error");
      setPriceCheckError(t("Price check is required before sending reservation."));
      return;
    }

    setReservationStatus("loading");
    setReservationError("");
    setFieldErrors({});

    const startDateTime = toApiDateTime(pickupDate, pickupTime);
    const billingPolicy = calculateRentalChargePolicy(
      parseDateTimeInput(pickupDate, pickupTime),
      parseDateTimeInput(dropoffDate, dropoffTime)
    );
    const endDateTime = formatDateTimeForApi(billingPolicy?.billableEnd);

    try {
      const response = await fetch("/api/car-reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleCode: carPriceCode,
          carPickUpDateTime: startDateTime,
          carDropOffDateTime: endDateTime,
          pickUpLocationId:
            cities.find((c) => c.name === pickupLocation)?.id || null,
          dropOffLocationId:
            cities.find((c) => c.name === dropoffLocation)?.id || null,
          firstName,
          lastName,
          email,
          phoneNumber,
          pickUpAdditionalLocation: pickUpAdditionalLocation || undefined,
          dropOffAdditionalLocation: dropOffAdditionalLocation || undefined,
          reservationItems: selectedExtras,
          language: locale,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const validationErrors = parseValidationErrors(payload);
        if (validationErrors) {
          setFieldErrors(validationErrors);
        }
        throw new Error(
          resolveApiError(
            payload,
            t,
            "Unable to create reservation. Please try again."
          )
        );
      }

      const code =
        payload?.reservationCode ||
        payload?.data?.reservationCode ||
        "";
      setReservationCode(code);
      setReservationStatus("success");
    } catch (error) {
      setReservationStatus("error");
      setReservationError(
        error?.message || t("Unable to create reservation. Please try again.")
      );
    }
  };

  const reservationForm = (
    <div className="content-box">
      <h6 className="title">{t("Reserve a vehicle")}</h6>
      <p className="text">
        {t(
          "Choose a date, pickup location, and send a message so we can confirm the reservation."
        )}
      </p>
      <form className="reservation-form" onSubmit={handleReservationSubmit}>
        <fieldset className="reservation-fieldset">
          <legend>{t("Pick-up")}</legend>
          <div className="reservation-field">
            <label htmlFor="pickupLocation">{t("Pick-up location")}</label>
            <CityAutocomplete
              id="pickupLocation"
              cities={cities}
              value={pickupLocation}
              onChange={setPickupLocation}
              placeholder={t("Select city")}
              required
            />
            {fieldErrors.pickupLocation && (
              <span className="field-error-inline">{t(fieldErrors.pickupLocation)}</span>
            )}
          </div>
          <div className="reservation-row">
            <div className="reservation-field">
              <label htmlFor="pickupDate">{t("Pickup date")}</label>
              <input
                id="pickupDate"
                type="date"
                min={today}
                required
                value={pickupDate}
                onChange={(event) => setPickupDate(event.target.value)}
              />
            </div>
            <div className="reservation-field">
              <label htmlFor="pickupTime">{t("Pickup time")}</label>
              <select
                id="pickupTime"
                required
                value={pickupTime}
                onChange={(event) => setPickupTime(event.target.value)}
              >
                <option value="">{t("Select time")}</option>
                {TIME_OPTIONS.map((time) => (
                  <option key={`pickup-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="reservation-field">
            <label htmlFor="pickUpAdditionalLocation">
              {t("Additional location details")}
            </label>
            <input
              id="pickUpAdditionalLocation"
              type="text"
              placeholder={t("e.g. Airport Terminal 1")}
              value={pickUpAdditionalLocation}
              onChange={(e) => setPickUpAdditionalLocation(e.target.value)}
            />
          </div>
        </fieldset>
        <fieldset className="reservation-fieldset">
          <legend>{t("Drop-off")}</legend>
          <div className="reservation-field">
            <label htmlFor="dropoffLocation">{t("Drop-off location")}</label>
            <CityAutocomplete
              id="dropoffLocation"
              cities={cities}
              value={dropoffLocation}
              onChange={setDropoffLocation}
              placeholder={t("Select city")}
              required
            />
            {fieldErrors.dropoffLocation && (
              <span className="field-error-inline">{t(fieldErrors.dropoffLocation)}</span>
            )}
          </div>
          <div className="reservation-row">
            <div className="reservation-field">
              <label htmlFor="dropoffDate">{t("Drop-off date")}</label>
              <input
                id="dropoffDate"
                type="date"
                min={minDropoffDate}
                required
                value={dropoffDate}
                onChange={(event) => setDropoffDate(event.target.value)}
              />
            </div>
            <div className="reservation-field">
              <label htmlFor="dropoffTime">{t("Drop-off time")}</label>
              <select
                id="dropoffTime"
                required
                value={dropoffTime}
                onChange={(event) => setDropoffTime(event.target.value)}
              >
                <option value="">{t("Select time")}</option>
                {TIME_OPTIONS.map((time) => (
                  <option key={`dropoff-${time}`} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="reservation-field">
            <label htmlFor="dropOffAdditionalLocation">
              {t("Additional location details")}
            </label>
            <input
              id="dropOffAdditionalLocation"
              type="text"
              placeholder={t("e.g. Airport Terminal 1")}
              value={dropOffAdditionalLocation}
              onChange={(e) => setDropOffAdditionalLocation(e.target.value)}
            />
          </div>
        </fieldset>
        {reservationItems.length > 0 && (
          <fieldset className="reservation-fieldset">
            <legend>{t("Extras")}</legend>
            <div className="reservation-extras">
              {reservationItems.map((item) => (
                <label
                  key={item.code}
                  className="reservation-extras__item"
                >
                  <input
                    type="checkbox"
                    checked={selectedExtras.includes(item.code)}
                    onChange={() => handleExtraToggle(item.code)}
                  />
                  <span>{t(item.code)}</span>
                  <span className="reservation-extras__price">
                    {item.price}€
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {priceCheckError && <p className="field-error-text">{priceCheckError}</p>}
        {canReserve && calculatedPrice !== null && (
          <div className="price-breakdown">
            {priceBreakdown?.reservationItemsPrices &&
              (Array.isArray(priceBreakdown.reservationItemsPrices)
                ? priceBreakdown.reservationItemsPrices
                : Object.entries(priceBreakdown.reservationItemsPrices).map(
                    ([code, price]) => ({ code, price })
                  )
              ).map((item) => (
                <div key={item.code} className="price-breakdown__row">
                  <span>{t(item.code)}</span>
                  <span>
                    {formatCalculatedPrice(item.price, calculatedCurrency)}
                  </span>
                </div>
              ))}
            <div className="price-breakdown__total">
              <span>{t("Total")}</span>
              <span>
                {formatCalculatedPrice(calculatedPrice, calculatedCurrency)}
              </span>
            </div>
          </div>
        )}
        {rentalChargePolicy && (
          <p className="text">
            {t("Chargeable rental days: {count}", {
              count: rentalChargePolicy.chargeableDays,
            })}
          </p>
        )}
        {canReserve && (
          <fieldset className="reservation-fieldset">
            <legend>{t("Your details")}</legend>
            <div className="reservation-row">
              <div className="reservation-field">
                <label htmlFor="firstName">{t("First name")}</label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {fieldErrors.firstName && (
                  <span className="field-error-inline">{t(fieldErrors.firstName)}</span>
                )}
              </div>
              <div className="reservation-field">
                <label htmlFor="lastName">{t("Last name")}</label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {fieldErrors.lastName && (
                  <span className="field-error-inline">{t(fieldErrors.lastName)}</span>
                )}
              </div>
            </div>
            <div className="reservation-field">
              <label htmlFor="email">{t("Email")}</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {fieldErrors.email && (
                <span className="field-error-inline">{t(fieldErrors.email)}</span>
              )}
            </div>
            <div className="reservation-field">
              <label htmlFor="phoneNumber">{t("Phone number")}</label>
              <PhoneInput
                id="phoneNumber"
                required
                value={phoneNumber}
                onChange={setPhoneNumber}
              />
              {fieldErrors.phoneNumber && (
                <span className="field-error-inline">{t(fieldErrors.phoneNumber)}</span>
              )}
            </div>
          </fieldset>
        )}
        {reservationError && (
          <p className="alert-error">{reservationError}</p>
        )}
        {reservationStatus === "success" ? (
          <div className="reservation-success">
            <p>{t("Reservation created successfully!")}</p>
            {reservationCode && (
              <p>
                {t("Booking code")}: <strong>{reservationCode}</strong>
              </p>
            )}
          </div>
        ) : canReserve ? (
          <button
            type="submit"
            className="side-btn reservation-submit"
            disabled={reservationStatus === "loading"}
          >
            {reservationStatus === "loading"
              ? t("Sending...")
              : t("Reserve now")}
          </button>
        ) : (
          <button
            type="button"
            className="side-btn reservation-submit"
            onClick={handlePriceCheck}
            disabled={priceCheckStatus === "loading"}
          >
            {priceCheckStatus === "loading"
              ? t("Checking price...")
              : t("Check price")}
          </button>
        )}
        <div className="reservation-policy">
          <button type="button" className="reservation-policy__trigger">
            <i className="ri-information-line" aria-hidden="true" />
            <span>{t("Cross-Border Travel Policy")}</span>
          </button>
          <div className="reservation-policy__tooltip" role="note">
            {CROSS_BORDER_POLICY_PARAGRAPHS.map((paragraph, index) => (
              <p key={`cross-border-policy-${index}`}>{t(paragraph)}</p>
            ))}
          </div>
        </div>
        <div className="reservation-policy">
          <button type="button" className="reservation-policy__trigger">
            <i className="ri-time-line" aria-hidden="true" />
            <span>{t("Rental Calculation & Late Return Policy")}</span>
          </button>
          <div className="reservation-policy__tooltip" role="note">
            {RENTAL_CALCULATION_POLICY_PARAGRAPHS.map((paragraph, index) => (
              <p key={`rental-calculation-policy-${index}`}>{t(paragraph)}</p>
            ))}
          </div>
        </div>
        <div className="reservation-deposit-info">
          <i className="ri-secure-payment-line" aria-hidden="true" />
          <span>{t("A refundable security deposit of €100 is required at vehicle pickup.")}</span>
        </div>
      </form>
    </div>
  );

  return (
    <>
      <section className="inventory-section pb-0 layout-radius">
        <div className="boxcar-container">
          <div className="boxcar-title-three">
            <ul className="breadcrumb">
              <li>
                <Link href={`/`}>{t("Home")}</Link>
              </li>
              <li>
                <Link href={`/cars`}>{t("Our vehicles")}</Link>
              </li>
              <li>
                <span>{carItem?.title || t("Vehicle")}</span>
              </li>
            </ul>
          </div>
          <Gallery>
            <div className="row">
              <div className="inspection-column col-lg-8 col-md-12 col-sm-12">
                <div className="inner-column">
                  <div className="gallery-sec gallery-slider">
                    <div className="row">
                      <div className="col-12">
                        <div className="wrap-slider-gallery">
                          <Slider
                            className="gallery-main-slider"
                            asNavFor={navThumbs}
                            ref={mainSliderRef}
                            arrows={showArrows}
                            dots={false}
                            infinite={false}
                            slidesToShow={1}
                            slidesToScroll={1}
                            adaptiveHeight
                          >
                            {sliderImages.map((image, index) => (
                              <div
                                className="gallery-main-slide"
                                key={`${image}-${index}`}
                              >
                                <div className="image-box">
                                  <figure className="image">
                                    <Item
                                      original={image}
                                      thumbnail={image}
                                      width={1200}
                                      height={800}
                                    >
                                      {({ ref, open }) => (
                                        <button
                                          type="button"
                                          className="gallery-main-trigger"
                                          ref={ref}
                                          onClick={open}
                                          aria-label={`${carItem?.title || ""} ${index + 1}`}
                                        >
                                          <Image
                                            alt={carItem?.title || ""}
                                            src={image}
                                            width={1200}
                                            height={800}
                                            className="gallery-main-image"
                                          />
                                        </button>
                                      )}
                                    </Item>
                                  </figure>
                                </div>
                              </div>
                            ))}
                          </Slider>
                        </div>
                        {showThumbs && (
                          <div className="gallery-thumbs">
                            <Slider
                              className="gallery-thumbs-slider"
                              asNavFor={navMain}
                              ref={thumbSliderRef}
                              arrows={false}
                              dots={false}
                              infinite={false}
                              slidesToShow={thumbSlidesToShow}
                              slidesToScroll={1}
                              swipeToSlide
                              focusOnSelect
                              responsive={[
                                {
                                  breakpoint: 992,
                                  settings: { slidesToShow: thumbSlidesMd },
                                },
                                {
                                  breakpoint: 768,
                                  settings: { slidesToShow: thumbSlidesSm },
                                },
                                {
                                  breakpoint: 576,
                                  settings: { slidesToShow: thumbSlidesXs },
                                },
                              ]}
                            >
                              {sliderImages.map((image, index) => (
                                <div
                                  className="gallery-thumb"
                                  key={`${image}-thumb-${index}`}
                                >
                                  <Image
                                    alt={carItem?.title || ""}
                                    src={image}
                                    width={200}
                                    height={140}
                                    className="gallery-thumb-image"
                                  />
                                </div>
                              ))}
                            </Slider>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="overview-sec">
                    <Overview
                      detail={detail}
                      t={t}
                      title={carItem?.title || t("Vehicle")}
                    />
                  </div>
                  <div className="description-sec">
                    <Description detail={detail} />
                  </div>
                </div>
              </div>
              <div className="side-bar-column style-1 col-lg-4 col-md-12 col-sm-12">
                <div className="inner-column">
                  {!isMobile && (
                    <div className="reservation-box sticky-reservation">
                      {reservationForm}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Gallery>
        </div>
        <RelatedCars />
      </section>
      {isReservationModalOpen && (
        <div
          className="reservation-modal"
          role="dialog"
          aria-modal="true"
          aria-label={t("Reserve a vehicle")}
        >
          <div
            className="reservation-modal__overlay"
            onClick={closeReservationModal}
          />
          <div className="reservation-modal__content">
            <button
              type="button"
              className="reservation-modal__close"
              onClick={closeReservationModal}
              aria-label={t("Close")}
            >
              <span aria-hidden="true">&times;</span>
            </button>
            <div className="reservation-box reservation-box--modal">
              {reservationForm}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
