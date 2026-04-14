"use client";
import React, { useId } from "react";
import { useLanguage } from "@/context/LanguageContext";

const normalizePriceValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  const cleaned = String(value).replace(/[^0-9.]/g, "");
  if (!cleaned) {
    return null;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function PriceWithInfo({
  value,
  className = "",
  showInfo = true,
  currency = "€",
}) {
  const { t } = useLanguage();
  const translate = typeof t === "function" ? t : (text) => text;
  const normalized = normalizePriceValue(value);
  const hasPrice = normalized !== null;
  const noPriceLabel = translate("Price on request");
  const infoLabel = translate("Price varies by number of days");
  const tooltipId = useId();

  return (
    <span className={`price-with-info ${className}`.trim()}>
      <span className="price-amount">
        {hasPrice ? `${currency}${normalized}` : noPriceLabel}
      </span>
      {showInfo && hasPrice ? (
        <span
          className="price-info"
          aria-label={infoLabel}
          aria-describedby={tooltipId}
          tabIndex={0}
        >
          <span aria-hidden="true" style={{ fontStyle: "italic", fontFamily: "Georgia, serif", fontWeight: "700", fontSize: "0.85em", lineHeight: 1 }}>i</span>
          <span id={tooltipId} role="tooltip" className="price-tooltip-text">
            {infoLabel}
          </span>
        </span>
      ) : null}
    </span>
  );
}
