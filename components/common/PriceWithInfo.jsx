"use client";
import React, { useId } from "react";
import { useLanguage } from "@/context/LanguageContext";

const DEFAULT_FALLBACK = 50;

const normalizePriceValue = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function PriceWithInfo({
  value,
  fallback = DEFAULT_FALLBACK,
  className = "",
  showInfo = true,
  currency = "€",
}) {
  const { t } = useLanguage();
  const translate = typeof t === "function" ? t : (text) => text;
  const normalized = normalizePriceValue(value);
  const displayPrice = normalized ? normalized : fallback;
  const infoLabel = translate("Price varies by number of days");
  const tooltipId = useId();

  return (
    <span className={`price-with-info ${className}`.trim()}>
      <span className="price-amount">
        {currency}
        {displayPrice}
      </span>
      {showInfo ? (
        <span
          className="price-info"
          aria-label={infoLabel}
          aria-describedby={tooltipId}
          tabIndex={0}
        >
          <i className="ri-information-line" aria-hidden="true" />
          <span id={tooltipId} role="tooltip" className="price-tooltip-text">
            {infoLabel}
          </span>
        </span>
      ) : null}
    </span>
  );
}
