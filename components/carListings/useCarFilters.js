"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const FILTER_KEYS = [
  "engineType",
  "transmissionType",
  "fuelType",
  "manufactureYear",
  "minPrice",
  "maxPrice",
  "startingDate",
  "endingDate",
  "pickupDateTime",
  "dropoffDateTime",
];

const getFilterValue = (searchParams, key) => {
  if (!searchParams) {
    return "";
  }
  const value = searchParams.get(key);
  return value ? value : "";
};
const getDateFilterValue = (searchParams, primaryKey, legacyKey) => {
  const primaryValue = getFilterValue(searchParams, primaryKey);
  if (primaryValue) {
    return primaryValue;
  }
  return getFilterValue(searchParams, legacyKey);
};

export function useCarFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo(
    () => ({
      engineType: getFilterValue(searchParams, "engineType"),
      transmissionType: getFilterValue(searchParams, "transmissionType"),
      fuelType: getFilterValue(searchParams, "fuelType"),
      manufactureYear: getFilterValue(searchParams, "manufactureYear"),
      minPrice: getFilterValue(searchParams, "minPrice"),
      maxPrice: getFilterValue(searchParams, "maxPrice"),
      startingDate: getDateFilterValue(
        searchParams,
        "startingDate",
        "pickupDateTime"
      ),
      endingDate: getDateFilterValue(
        searchParams,
        "endingDate",
        "dropoffDateTime"
      ),
    }),
    [searchParams]
  );

  const setFilters = useCallback(
    (updates) => {
      const params = new URLSearchParams(
        searchParams ? searchParams.toString() : ""
      );
      if ("startingDate" in (updates || {})) {
        params.delete("pickupDateTime");
      }
      if ("endingDate" in (updates || {})) {
        params.delete("dropoffDateTime");
      }
      Object.entries(updates || {}).forEach(([key, value]) => {
        if (!FILTER_KEYS.includes(key)) {
          return;
        }
        if (value) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });
      const query = params.toString();
      const normalizedQuery = query.replace(/\+/g, "%20");
      const nextUrl = normalizedQuery ? `${pathname}?${normalizedQuery}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : ""
    );
    FILTER_KEYS.forEach((key) => params.delete(key));
    const query = params.toString();
    const normalizedQuery = query.replace(/\+/g, "%20");
    const nextUrl = normalizedQuery ? `${pathname}?${normalizedQuery}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  return { filters, setFilters, resetFilters };
}
