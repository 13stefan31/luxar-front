"use client";
import React, { useEffect, useMemo, useState } from "react";
import SelectComponent from "../common/SelectComponent";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useCarFilters } from "./useCarFilters";

const splitDateTime = (value) => {
  if (!value) {
    return { date: "", time: "" };
  }
  const [date, time] = String(value).split("T");
  return { date: date || "", time: time || "" };
};
export default function Sidebar() {
  const { t } = useLanguage();
  const { filters, setFilters } = useCarFilters();
  const [draftFilters, setDraftFilters] = useState(filters);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [dropoffTime, setDropoffTime] = useState("");
  const filterKey = `${filters.engineType}|${filters.transmissionType}|${filters.fuelType}|${filters.manufactureYear}|${filters.minPrice}|${filters.maxPrice}|${filters.pickupDateTime}|${filters.dropoffDateTime}`;
  useEffect(() => {
    setDraftFilters(filters);
    const nextPickup = splitDateTime(filters.pickupDateTime);
    const nextDropoff = splitDateTime(filters.dropoffDateTime);
    setPickupDate(nextPickup.date);
    setPickupTime(nextPickup.time);
    setDropoffDate(nextDropoff.date);
    setDropoffTime(nextDropoff.time);
  }, [filterKey]);
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
    const pickupDateTime =
      pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : "";
    const dropoffDateTime =
      dropoffDate && dropoffTime ? `${dropoffDate}T${dropoffTime}` : "";
    nextFilters.pickupDateTime = pickupDateTime;
    nextFilters.dropoffDateTime = dropoffDateTime;
    setFilters(nextFilters);
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
                          onChange={(event) => setPickupDate(event.target.value)}
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
                          onChange={(event) => setDropoffDate(event.target.value)}
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
