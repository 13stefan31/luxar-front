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
      pickupDateTime: getFilterValue(searchParams, "pickupDateTime"),
      dropoffDateTime: getFilterValue(searchParams, "dropoffDateTime"),
    }),
    [searchParams]
  );

  const setFilters = useCallback(
    (updates) => {
      const params = new URLSearchParams(
        searchParams ? searchParams.toString() : ""
      );
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
      const nextUrl = query ? `${pathname}?${query}` : pathname;
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
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  return { filters, setFilters, resetFilters };
}
