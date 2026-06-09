import "server-only";

import { headers } from "next/headers";
import translations from "@/locales";
import { defaultLocale, supportedLocales, localizePath } from "./i18nRoutes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxar-car-rental-montenegro.me";
const HREFLANG = { en: "en", me: "sr-ME", ru: "ru" };

const buildHreflang = (internalPath, locale) => {
  if (!internalPath) return {};
  const canonicalPath = localizePath(internalPath, locale || defaultLocale);
  const canonical = `${SITE_URL}${canonicalPath}`;
  const languages = Object.fromEntries(
    supportedLocales.map((l) => [
      HREFLANG[l] || l,
      `${SITE_URL}${localizePath(internalPath, l)}`,
    ])
  );
  languages["x-default"] = `${SITE_URL}${localizePath(internalPath, defaultLocale)}`;
  return { alternates: { canonical, languages } };
};

const BRAND_SUFFIX_KEY = "meta.brandSuffix";

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

// Reads locale exclusively from the x-locale header set by middleware.
// This header is always present (defaultLocale for non-prefixed URLs).
// We intentionally ignore Accept-Language and cookies here — SEO metadata
// must reflect the page URL's language, not the visitor's browser preference.
const resolveLocale = () => {
  const xLocale = headers().get("x-locale");
  if (xLocale && supportedLocales.includes(xLocale)) {
    return xLocale;
  }
  return defaultLocale;
};

export const getPreferredLocale = () => resolveLocale();

export const createLocalizedMetadata = ({
  titleKey,
  titleFallback,
  descriptionKey,
  descriptionFallback,
  appendBrandSuffix = true,
  buildExtra,
}) => {
  return async ({ params }) => {
    const locale = resolveLocale();
    const internalPath = headers().get("x-pathname");
    const suffix = appendBrandSuffix
      ? translate(BRAND_SUFFIX_KEY, locale, "|| LUXAR TRADE - rent a car")
      : "";
    const translatedTitle = translate(titleKey, locale, titleFallback);
    const titleParts = [translatedTitle];
    if (suffix) {
      titleParts.push(suffix);
    }
    const description = translate(descriptionKey, locale, descriptionFallback);
    const extra = buildExtra ? buildExtra({ locale, params }) : {};
    return {
      title: titleParts.join(" "),
      description,
      ...buildHreflang(internalPath, locale),
      ...extra,
    };
  };
};
