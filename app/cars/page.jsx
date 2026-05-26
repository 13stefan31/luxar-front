import Cars from "@/components/carListings/Cars";
import Sidebar from "@/components/carListings/Sidebar";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { getInventoryApiHeaders, INVENTORY_API_ROOT } from "@/lib/inventoryApi";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";

export const generateMetadata = createLocalizedMetadata({
  titleKey: "meta.cars.title",
  titleFallback: "Rent a Car in Montenegro – Browse Our Fleet",
  descriptionKey: "meta.cars.description",
  descriptionFallback: "Browse our full fleet of rental cars in Montenegro. Easy online booking.",
  appendBrandSuffix: false,
});

const FILTER_KEYS = [
  "engineType",
  "transmissionType",
  "fuelType",
  "manufactureYear",
];

const getQueryValue = (searchParams, key) => {
  if (!searchParams || typeof searchParams !== "object") {
    return "";
  }
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return typeof value[0] === "string" ? value[0] : "";
  }
  return typeof value === "string" ? value : "";
};

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

const toApiDateFormat = (value) => {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  const localMatch = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (localMatch) {
    return `${localMatch[3]}-${localMatch[2]}-${localMatch[1]}`;
  }
  return raw;
};

const splitDateTime = (value) => {
  if (!value) {
    return { date: "", time: "" };
  }
  const raw = String(value).trim();
  if (!raw) {
    return { date: "", time: "" };
  }
  const match = raw.match(/^([^ T]+)(?:[ T](.+))?$/);
  if (!match) {
    return { date: raw, time: "" };
  }
  return {
    date: toApiDateFormat(match[1] || ""),
    time: normalizeTimeTo24h(match[2] || ""),
  };
};

const formatRequestDateTime = (value) => {
  const { date, time } = splitDateTime(value);
  if (!date || !time) {
    return "";
  }
  return `${date} ${time}`;
};

const buildInitialCarsQuery = (searchParams) => {
  const params = new URLSearchParams();
  params.set("page", "1");

  FILTER_KEYS.forEach((key) => {
    const value = getQueryValue(searchParams, key).trim();
    if (value) {
      params.set(key, value);
    }
  });

  const startingDate = formatRequestDateTime(
    getQueryValue(searchParams, "startingDate")
  );
  if (startingDate) {
    params.set("startingDate", startingDate);
  }

  const endingDate = formatRequestDateTime(
    getQueryValue(searchParams, "endingDate")
  );
  if (endingDate) {
    params.set("endingDate", endingDate);
  }

  return params.toString().replace(/\+/g, "%20");
};

const fetchInitialCarsPayload = async (searchParams) => {
  try {
    const query = buildInitialCarsQuery(searchParams);
    const response = await fetch(`${INVENTORY_API_ROOT}/cars?${query}`, {
      cache: "no-store",
      headers: getInventoryApiHeaders(),
    });
    if (!response.ok) {
      return null;
    }
    const payload = await response.json();
    return {
      data: Array.isArray(payload?.data) ? payload.data : [],
      meta: payload?.meta && typeof payload.meta === "object" ? payload.meta : {},
    };
  } catch {
    return null;
  }
};

export default async function CarsPage({ searchParams }) {
  const resolvedSearchParams = (await searchParams) || {};
  const initialPayload = await fetchInitialCarsPayload(resolvedSearchParams);

  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Sidebar />
      <Cars initialPayload={initialPayload} />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
