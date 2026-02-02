import Image from "next/image";
import React from "react";

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

const formatFuel = (value, translate) => {
  if (!value) {
    return "—";
  }
  const label = FUEL_LABELS[value] || value;
  if (!label) {
    return "—";
  }
  const normalized = humanizeText(label);
  if (!normalized) {
    return label;
  }
  return translate(normalized);
};
const formatTransmission = (value, translate) => {
  if (!value) {
    return "—";
  }
  const label = TRANSMISSION_LABELS[value] || value;
  if (!label) {
    return "—";
  }
  const normalized = humanizeText(label);
  if (!normalized) {
    return label;
  }
  return translate(normalized);
};
const normalizeFieldValue = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};
const humanizeText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }
  const cleaned = String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) {
    return "";
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};
const translateStringValue = (value, translate) => {
  const normalized = normalizeFieldValue(value);
  if (normalized === undefined) {
    return undefined;
  }
  if (typeof normalized !== "string") {
    return normalized;
  }
  const text = humanizeText(normalized);
  if (!text) {
    return normalized;
  }
  return translate(text);
};
const formatEquipmentValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return "";
  }
  if (value === true) {
    return "Yes";
  }
  if (value === false) {
    return "No";
  }
  return humanizeText(value);
};

const splitIntoColumns = (items, columns = 2) => {
  if (!items.length) {
    return Array.from({ length: columns }, () => []);
  }
  const chunkSize = Math.ceil(items.length / columns);
  return Array.from({ length: columns }, (_, index) =>
    items.slice(index * chunkSize, index * chunkSize + chunkSize)
  );
};

export default function Overview({ detail = {}, t }) {
  const translate = typeof t === "function" ? t : (value) => value;
  const detailItems = [
    {
      icon: "/images/icons/cv4.svg",
      label: translate("Year"),
      value: detail.manufactureYear ?? detail.year_of_manufacture,
    },
    {
      icon: "/images/icons/cv8.svg",
      label: translate("Engine size"),
      value: detail.engine ? `${detail.engine} cc` : detail.engine_type,
    },
    {
      icon: "/images/icons/cv2.svg",
      label: translate("Engine power"),
      value: detail.enginePower ? `${detail.enginePower} hp` : detail.engine_power,
    },
    {
      icon: "/images/icons/cv10.svg",
      label: translate("Transmission"),
      value:
        formatTransmission(detail.transmissionType, translate) ||
        formatTransmission(detail.transmission_type, translate),
    },
    {
      icon: "/images/icons/cv3.svg",
      label: translate("Fuel type"),
      value:
        formatFuel(detail.fuelType, translate) ||
        formatFuel(detail.fuel_type, translate),
    },
    {
      icon: "/images/icons/cv11.svg",
      label: translate("Color"),
      value:
        translateStringValue(detail.colorItem, translate) ||
        translateStringValue(detail.color_item, translate),
    },
    {
      icon: "/images/icons/cv7.svg",
      label: translate("Seats"),
      value: detail.seatCapacity ?? detail.seats_number,
    },
    {
      icon: "/images/icons/cv1.svg",
      label: translate("Doors"),
      value: detail.doorCount ?? detail.door_number,
    },
    {
      icon: "/images/icons/cv6.svg",
      label: translate("Air conditioning"),
      value:
        detail.doesHaveAirConditioning === undefined
          ? undefined
          : detail.doesHaveAirConditioning
          ? translate("Yes")
          : translate("No"),
    },
  ]
    .map((item) => ({ ...item, value: normalizeFieldValue(item.value) }))
    .filter((item) => item.value !== undefined);

  const columns = splitIntoColumns(detailItems, 2);

  const equipmentEntries = Object.entries(detail.equipment || {})
    .map(([key, value]) => {
      const formattedValue = formatEquipmentValue(value);
      if (!formattedValue) {
        return null;
      }
      return {
        label: humanizeText(key),
        value: formattedValue,
      };
    })
    .filter(Boolean);

  return (
    <>
      <h4 className="title">{translate("Car Overview")}</h4>
      <div className="row">
        {columns.map((column, index) =>
          column.length ? (
            <div
              key={`overview-col-${index}`}
              className="content-column col-lg-6 col-md-12 col-sm-12"
            >
              <div className="inner-column">
                <ul className="list">
                  {column.map((item) => (
                    <li key={item.label}>
                      <span>
                        <Image src={item.icon} width={18} height={18} alt="" />
                        {item.label}
                      </span>
                      {item.value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null
        )}
      </div>
      {!detailItems.length && (
        <p className="text">
          {translate("Vehicle details are not available.")}
        </p>
      )}
      {equipmentEntries.length > 0 && (
        <div className="row">
          <div className="content-column col-lg-12 col-md-12 col-sm-12">
            <div className="inner-column">
              <h5 className="title">{translate("Equipment")}</h5>
              <ul className="list">
                {equipmentEntries.map((entry) => (
                  <li key={`${entry.label}-${entry.value}`}>
                    <span>{entry.label}</span>
                    {entry.value}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
