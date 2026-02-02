"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import translations from "@/locales";
import { defaultLocale, getLocaleFromPath, localizeHref } from "@/lib/i18nRoutes";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchParamsString = useMemo(
    () => (searchParams ? searchParams.toString() : ""),
    [searchParams]
  );
  const initialLocale = getLocaleFromPath(pathname);
  const [locale, setLocaleState] = useState(initialLocale || defaultLocale);
  const currentTranslations = useMemo(
    () => translations[locale] ?? translations.en,
    [locale]
  );

  useEffect(() => {
    const detectedLocale = getLocaleFromPath(pathname);
    if (detectedLocale && detectedLocale !== locale) {
      setLocaleState(detectedLocale);
    }
  }, [pathname, locale]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = useCallback(
    (key, vars) => {
      const template =
        currentTranslations?.[key] ?? translations.en?.[key] ?? key;
      if (!vars) {
        return template;
      }
      return String(template).replace(/\{([\w-]+)\}/g, (match, name) => {
        const value = vars[name];
        if (value === undefined || value === null) {
          return match;
        }
        return String(value);
      });
    },
    [currentTranslations]
  );

  const setLocale = useCallback(
    (nextLocale) => {
      if (!nextLocale || nextLocale === locale) {
        return;
      }
      setLocaleState(nextLocale);
      const queryString = searchParamsString;
      const safePathname = pathname || "/";
      const currentPath = queryString
        ? `${safePathname}?${queryString}`
        : safePathname;
      const localizedPath = localizeHref(currentPath, nextLocale);
      if (localizedPath && localizedPath !== currentPath) {
        router.push(localizedPath);
      }
    },
    [locale, pathname, router, searchParamsString]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
