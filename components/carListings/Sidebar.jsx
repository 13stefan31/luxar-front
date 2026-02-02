"use client";
import React, { useEffect, useMemo, useState } from "react";
import SelectComponent from "../common/SelectComponent";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { useCarFilters } from "./useCarFilters";
export default function Sidebar() {
  const { t } = useLanguage();
  const { filters, setFilters } = useCarFilters();
  const [draftFilters, setDraftFilters] = useState(filters);
  const filterKey = `${filters.engineType}|${filters.transmissionType}|${filters.fuelType}|${filters.manufactureYear}|${filters.minPrice}|${filters.maxPrice}`;
  useEffect(() => {
    setDraftFilters(filters);
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
    setFilters(draftFilters);
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
                    className="row g-0"
                  >
                    <div className="form-column col-lg-6">
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
                    <div className="form-column v2 col-lg-6">
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
