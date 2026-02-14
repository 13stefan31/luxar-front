"use client";
import React, { useEffect, useMemo, useState } from "react";
import SelectComponent from "../common/SelectComponent";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useCarFilters } from "./useCarFilters";

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
export default function Sidebar() {
  const { t } = useLanguage();
  const { filters, setFilters } = useCarFilters();
  const [draftFilters, setDraftFilters] = useState(filters);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [dropoffTime, setDropoffTime] = useState("");
  const today = useMemo(() => getTodayInputDate(), []);
  const minDropoffDate = useMemo(
    () => resolveMinDropoffDate(pickupDate, today),
    [pickupDate, today]
  );
  const filterKey = `${filters.engineType}|${filters.transmissionType}|${filters.fuelType}|${filters.manufactureYear}|${filters.minPrice}|${filters.maxPrice}|${filters.startingDate}|${filters.endingDate}`;
  useEffect(() => {
    setDraftFilters(filters);
    const nextPickup = splitDateTime(filters.startingDate);
    const nextDropoff = splitDateTime(filters.endingDate);
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
    setPickupTime(nextPickup.time);
    setDropoffDate(normalizedDropoffDate);
    setDropoffTime(nextDropoff.time);
  }, [filterKey, today]);
  const {
    engineType: draftEngineType,
    transmissionType: draftTransmissionType,
    fuelType: draftFuelType,
    manufactureYear: draftManufactureYear,
    minPrice: draftMinPrice,
    maxPrice: draftMaxPrice,
  } = draftFilters;
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
    const startingDate =
      normalizedPickupDate && normalizedPickupTime
        ? `${normalizedPickupDate} ${normalizedPickupTime}`
        : "";
    const endingDate =
      normalizedDropoffDate && normalizedDropoffTime
        ? `${normalizedDropoffDate} ${normalizedDropoffTime}`
        : "";
    nextFilters.startingDate = startingDate;
    nextFilters.endingDate = endingDate;
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
  return (
    <div className="wrap-fixed-sidebar">
      <div className="sidebar-backdrop" />
      <div className="widget-sidebar-filter">
        <div className="fixed-sidebar-title">
          <h3>{t("More Filter")}</h3>
          <a href="#" title="" className="close-filters">
            <Image
              alt=""
              src="/images/icons/close.svg"
              width={30}
              height={30}
            />
          </a>
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
                          onChange={(event) => setPickupTime(event.target.value)}
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
                          onChange={(event) => setDropoffTime(event.target.value)}
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
                    <i className="flaticon-search" /> {t("Search vehicles")}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/*widget end*/}
        </div>
      </div>
    </div>
  );
}
