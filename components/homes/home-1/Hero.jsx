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
        </div>
      </div>
    </section>
  );
}
