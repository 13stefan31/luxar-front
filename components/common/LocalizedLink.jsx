"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { localizeHref } from "@/lib/i18nRoutes";

export default function LocalizedLink({ href, prefetch, ...props }) {
  const { locale } = useLanguage();
  const localizedHref = localizeHref(href, locale);

  const effectivePrefetch =
    prefetch ?? (process.env.NODE_ENV === "development" ? false : undefined);

  return <Link href={localizedHref} prefetch={effectivePrefetch} {...props} />;
}
