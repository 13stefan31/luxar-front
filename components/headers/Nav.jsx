"use client";

import { headerLinks } from "@/data/menu";
import Link from "@/components/common/LocalizedLink";
import { usePathname } from "next/navigation";
import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getInternalPathname } from "@/lib/i18nRoutes";

export default function Nav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const currentPath = getInternalPathname(pathname);
  const isActive = (href) => {
    const targetPath = getInternalPathname(href);
    return currentPath.split("/")[1] === targetPath.split("/")[1];
  };

  return (
    <>
      {headerLinks.map((item, index) => (
        <li key={index}>
          <Link
            href={item.href}
            className={isActive(item.href) ? "menuActive" : ""}
          >
            {t(item.title)}
          </Link>
        </li>
      ))}
    </>
  );
}
