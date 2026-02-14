import "server-only";

import { cookies, headers } from "next/headers";
import translations from "@/locales";
import { defaultLocale, supportedLocales } from "./i18nRoutes";

const BRAND_SUFFIX_KEY = "meta.brandSuffix";
const LOCALE_COOKIE = "NEXT_LOCALE";

const parseAcceptLanguage = (value) => {
  if (!value) {
    return null;
  }
  return value
    .split(",")
    .map((entry) => entry.split(";")[0].trim())
    .map((entry) => entry.split("-")[0])
    .find((entry) => supportedLocales.includes(entry));
};

const translate = (key, locale, fallback) => {
  const targetLocale = supportedLocales.includes(locale) ? locale : defaultLocale;
  const localeDict = translations[targetLocale];
  if (localeDict && localeDict[key]) {
    return localeDict[key];
  }
  const defaultDict = translations[defaultLocale];
  if (defaultDict && defaultDict[key]) {
    return defaultDict[key];
  }
  if (fallback) {
    return fallback;
  }
  return key;
};

const resolveLocale = (searchParams) => {
  const candidateFromSearch =
    searchParams?.locale || searchParams?.lang || searchParams?.lng;
  if (candidateFromSearch && supportedLocales.includes(candidateFromSearch)) {
    return candidateFromSearch;
  }
  const headerLocaleOverride = headers().get("x-locale");
  if (headerLocaleOverride && supportedLocales.includes(headerLocaleOverride)) {
    return headerLocaleOverride;
  }
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  if (cookieLocale && supportedLocales.includes(cookieLocale)) {
    return cookieLocale;
  }
  const headerLocale = parseAcceptLanguage(headers().get("accept-language"));
  if (headerLocale) {
    return headerLocale;
  }
  return defaultLocale;
};

export const getPreferredLocale = (searchParams) => resolveLocale(searchParams);

export const createLocalizedMetadata = ({
  titleKey,
  titleFallback,
  descriptionKey,
  descriptionFallback,
  appendBrandSuffix = true,
}) => {
  return async ({ searchParams }) => {
    const locale = resolveLocale(searchParams);
    const suffix = appendBrandSuffix
      ? translate(BRAND_SUFFIX_KEY, locale, "|| LUXAR TRADE - rent a car")
      : "";
    const translatedTitle = translate(titleKey, locale, titleFallback);
    const titleParts = [translatedTitle];
    if (suffix) {
      titleParts.push(suffix);
    }
    const description = translate(descriptionKey, locale, descriptionFallback);
    return {
      title: titleParts.join(" "),
      description,
    };
  };
};
