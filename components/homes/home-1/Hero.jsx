"use client";
import React, { useMemo, useState } from "react";
import Link from "@/components/common/LocalizedLink";
import SelectComponent from "@/components/common/SelectComponent";
import { useLanguage } from "@/context/LanguageContext";

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
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

const getDefaultPickupDate = () => {
  const tomorrow = addDays(new Date(), 1);
  return toLocalInputDate(tomorrow);
};

const getDefaultDropoffDate = () => {
  const tomorrow = addDays(new Date(), 1);
  const dropoff = addDays(tomorrow, 5);
  return toLocalInputDate(dropoff);
};

export default function Hero() {
  const { t } = useLanguage();
  const [engineType, setEngineType] = useState("");
  const [transmissionType, setTransmissionType] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [manufactureYear, setManufactureYear] = useState("");
  const [pickupDate, setPickupDate] = useState(getDefaultPickupDate);
  const [pickupTime, setPickupTime] = useState("12:00");
  const [dropoffDate, setDropoffDate] = useState(getDefaultDropoffDate);
  const [dropoffTime, setDropoffTime] = useState("12:00");
  const today = useMemo(() => getTodayInputDate(), []);
  const minDropoffDate = useMemo(
    () => resolveMinDropoffDate(pickupDate, today),
    [pickupDate, today]
  );
  const brandName = "Luxar";
  const heroTitle = t(
    "Welcome to Luxar Rent a Car - Leading Car Rental in Montenegro"
  );
  const heroTitleParts = heroTitle.split(brandName);
  const heroTitleContent =
    heroTitleParts.length > 1
      ? heroTitleParts.map((part, index) => (
          <React.Fragment key={`hero-title-${index}`}>
            {part}
            {index < heroTitleParts.length - 1 ? (
              <span className="brand-gold-text">{brandName}</span>
            ) : null}
          </React.Fragment>
        ))
      : heroTitle;
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
      pickupDate && pickupTime ? `${pickupDate} ${pickupTime}` : "";
    const dropoffDateTime =
      dropoffDate && dropoffTime ? `${dropoffDate} ${dropoffTime}` : "";
    if (pickupDateTime) {
      params.set("startingDate", pickupDateTime);
    }
    if (dropoffDateTime) {
      params.set("endingDate", dropoffDateTime);
    }
    const query = params.toString();
    const normalizedQuery = query.replace(/\+/g, "%20");
    return normalizedQuery ? `/cars?${normalizedQuery}` : "/cars";
  }, [pickupDate, pickupTime, dropoffDate, dropoffTime]);
  const handlePickerClick = (event) => {
    const input = event.currentTarget;
    if (typeof input?.showPicker === "function") {
      input.showPicker();
    }
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
    <section className="boxcar-banner-section-v1">
      <div className="container">
        <div className="banner-content">
          <h1 className="hero-title wow fadeInUp" data-wow-delay="100ms">
            {heroTitleContent}
          </h1>
          <h2 className="hero-subtitle wow fadeInUp" data-wow-delay="200ms">
            {t("Rent a Car. Explore Montenegro. Discover places buses never reach.")}
          </h2>
          <p className="hero-cta wow fadeInUp" data-wow-delay="300ms">
            {t("Montenegro starts when you turn the key!")}
          </p>


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
                      {t("Datum i vrijeme preuzimanja")}
                    </label>
                    <div className="search-input">
                      <input
                        id="pickupDate"
                        type="date"
                        value={pickupDate}
                        min={today}
                        onChange={handlePickupDateChange}
                        onClick={handlePickerClick}
                        aria-label={t("Pickup date")}
                        placeholder={t("Pickup date")}
                      />
                      <span className="search-icon" aria-hidden="true">
                        <i className="fa fa-calendar" />
                      </span>
                    </div>
                  </div>

                  <div className="search-field line-r">
                    <label
                      htmlFor="pickupTime"
                      className="search-label is-placeholder"
                      aria-hidden="true"
                    >
                      {t("Datum i vrijeme preuzimanja")}
                    </label>
                    <div className="search-input">
                      <input
                        id="pickupTime"
                        type="time"
                        step="1800"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        onClick={handlePickerClick}
                        aria-label={t("Pickup time")}
                        placeholder={t("Pickup time")}
                      />
                      <span className="search-icon" aria-hidden="true">
                        <i className="fa fa-clock" />
                      </span>
                    </div>
                  </div>

                  <div className="search-field line-r">
                    <label htmlFor="dropoffDate" className="search-label">
                      {t("Datum i vrijeme povrata")}
                    </label>
                    <div className="search-input">
                      <input
                        id="dropoffDate"
                        type="date"
                        value={dropoffDate}
                        min={minDropoffDate}
                        onChange={handleDropoffDateChange}
                        onClick={handlePickerClick}
                        aria-label={t("Drop-off date")}
                        placeholder={t("Drop-off date")}
                      />
                      <span className="search-icon" aria-hidden="true">
                        <i className="fa fa-calendar" />
                      </span>
                    </div>
                  </div>

                  <div className="search-field">
                    <label
                      htmlFor="dropoffTime"
                      className="search-label is-placeholder"
                      aria-hidden="true"
                    >
                      {t("Datum i vrijeme povrata")}
                    </label>
                    <div className="search-input">
                      <input
                        id="dropoffTime"
                        type="time"
                        step="1800"
                        value={dropoffTime}
                        onChange={(e) => setDropoffTime(e.target.value)}
                        onClick={handlePickerClick}
                        aria-label={t("Drop-off time")}
                        placeholder={t("Drop-off time")}
                      />
                      <span className="search-icon" aria-hidden="true">
                        <i className="fa fa-clock" />
                      </span>
                    </div>
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
