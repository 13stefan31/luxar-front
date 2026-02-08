"use client";
import React, { useMemo, useState } from "react";
import Link from "@/components/common/LocalizedLink";
import SelectComponent from "@/components/common/SelectComponent";
import { useLanguage } from "@/context/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();
  const [engineType, setEngineType] = useState("");
  const [transmissionType, setTransmissionType] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [manufactureYear, setManufactureYear] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [dropoffTime, setDropoffTime] = useState("");
  const engineTypeOptions = useMemo(
    () => [
      { value: "", label: t("Engine Type") },
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
      { value: "", label: t("Transmission") },
      { value: "A", label: t("Automatic") },
      { value: "M", label: t("Manual") },
    ],
    [t]
  );
  const fuelOptions = useMemo(
    () => [
      { value: "", label: t("Fuel Type") },
      { value: "D", label: t("Diesel") },
      { value: "P", label: t("Petrol") },
      { value: "H", label: t("Hybrid") },
      { value: "E", label: t("Electric") },
      { value: "G", label: t("Gas") },
    ],
    [t]
  );
  const searchHref = useMemo(() => {
    const params = new URLSearchParams();
    if (engineType) {
      params.set("engineType", engineType);
    }
    if (transmissionType) {
      params.set("transmissionType", transmissionType);
    }
    if (fuelType) {
      params.set("fuelType", fuelType);
    }
    if (manufactureYear) {
      params.set("manufactureYear", manufactureYear);
    }
    const query = params.toString();
    return query ? `/cars?${query}` : "/cars";
  }, [engineType, transmissionType, fuelType, manufactureYear]);
  const dateTimeSearchHref = useMemo(() => {
    const params = new URLSearchParams();
    const pickupDateTime =
      pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : "";
    const dropoffDateTime =
      dropoffDate && dropoffTime ? `${dropoffDate}T${dropoffTime}` : "";
    if (pickupDateTime) {
      params.set("pickupDateTime", pickupDateTime);
    }
    if (dropoffDateTime) {
      params.set("dropoffDateTime", dropoffDateTime);
    }
    const query = params.toString();
    return query ? `/cars?${query}` : "/cars";
  }, [pickupDate, pickupTime, dropoffDate, dropoffTime]);

  return (
    <section className="boxcar-banner-section-v1">
      <div className="container">
        <div className="banner-content">
          <span className="wow fadeInUp">
            {t("Rent a car quickly and easily")}
          </span>
          <h2 className="wow fadeInUp" data-wow-delay="100ms">
            {t("Find the perfect rental car")}
          </h2>


          {/*
          <div className="form-tab-content">
            <div
              className="form-tab-content wow fadeInUp"
              data-wow-delay="300ms"
            >
              <div className="form-tab-pane current" id="rent-tab">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="hero-filter-form"
                >
                  <div className="search-field line-r">
                    <SelectComponent
                      options={engineTypeOptions}
                      value={engineType}
                      onChange={setEngineType}
                      hideEmptyOption
                    />
                  </div>

                  <div className="search-field line-r">
                    <SelectComponent
                      options={transmissionOptions}
                      value={transmissionType}
                      onChange={setTransmissionType}
                      hideEmptyOption
                    />
                  </div>

                  <div className="search-field line-r">
                    <SelectComponent
                      options={fuelOptions}
                      value={fuelType}
                      onChange={setFuelType}
                      hideEmptyOption
                    />
                  </div>

                  <div className="search-field">
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      step="1"
                      placeholder={t("Manufacture Year")}
                      value={manufactureYear}
                      onChange={(e) => setManufactureYear(e.target.value)}
                      aria-label={t("Manufacture Year")}
                    />
                  </div>

                  <Link href={searchHref} className="form-submit">
                    <button type="submit" className="theme-btn">
                      <i className="flaticon-search" />
                      {t("Search vehicles")}

                    </button>
                  </Link>
                </form>
              </div>
            </div>
          </div>
          */}

          <div className="form-tab-content">
            <div
              className="form-tab-content wow fadeInUp"
              data-wow-delay="350ms"
            >
              <div className="form-tab-pane current" id="date-time-tab">
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="hero-filter-form hero-datetime-form"
                >
                  <div className="search-field line-r">
                    <label htmlFor="pickupDate" className="search-label">
                      {t("Pickup date")}
                    </label>
                    <input
                      id="pickupDate"
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      aria-label={t("Pickup date")}
                      placeholder={t("Pickup date")}
                    />
                  </div>

                  <div className="search-field line-r">
                    <label htmlFor="pickupTime" className="search-label">
                      {t("Pickup time")}
                    </label>
                    <input
                      id="pickupTime"
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      aria-label={t("Pickup time")}
                      placeholder={t("Pickup time")}
                    />
                  </div>

                  <div className="search-field line-r">
                    <label htmlFor="dropoffDate" className="search-label">
                      {t("Drop-off date")}
                    </label>
                    <input
                      id="dropoffDate"
                      type="date"
                      value={dropoffDate}
                      onChange={(e) => setDropoffDate(e.target.value)}
                      aria-label={t("Drop-off date")}
                      placeholder={t("Drop-off date")}
                    />
                  </div>

                  <div className="search-field">
                    <label htmlFor="dropoffTime" className="search-label">
                      {t("Drop-off time")}
                    </label>
                    <input
                      id="dropoffTime"
                      type="time"
                      value={dropoffTime}
                      onChange={(e) => setDropoffTime(e.target.value)}
                      aria-label={t("Drop-off time")}
                      placeholder={t("Drop-off time")}
                    />
                  </div>

                  <Link href={dateTimeSearchHref} className="form-submit">
                    <button type="submit" className="theme-btn">
                      <i className="flaticon-search" />
                      {t("Search vehicles")}
                    </button>
                  </Link>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
