"use client";

import { headerLinks } from "@/data/menu";
import Link from "@/components/common/LocalizedLink";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getInternalPathname } from "@/lib/i18nRoutes";

export default function MobileMenu() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setShowMenu(true);

    const mobileNavigation = document.querySelectorAll('[href="#nav-mobile"]');
    const mobileMenu = document.getElementById("nav-mobile");
    const mobileMenuOverlay = document.getElementById("mobileOverlay");

    const toggleActiveClass = (e) => {
      e.preventDefault();
      mobileNavigation.forEach((elm) => elm.classList.toggle("active"));
      mobileMenu?.classList.toggle("mm-menu_opened");
      mobileMenuOverlay?.classList.toggle("active");
    };

    mobileNavigation.forEach((elm) =>
      elm.addEventListener("click", toggleActiveClass)
    );

    return () => {
      mobileNavigation.forEach((elm) =>
        elm.removeEventListener("click", toggleActiveClass)
      );
    };
  }, [pathname]);

  const closeMenu = () => {
    document.querySelectorAll('[href="#nav-mobile"]').forEach((elm) =>
      elm.classList.remove("active")
    );
    document.getElementById("nav-mobile")?.classList.remove("mm-menu_opened");
    document.getElementById("mobileOverlay")?.classList.remove("active");
  };

  const currentPath = getInternalPathname(pathname);
  const isActive = (href) =>
    currentPath.split("/")[1] ===
    getInternalPathname(href).split("/")[1];

  return (
    <>
      <div
        id="nav-mobile"
        className="mm-menu mm-menu_offcanvas mm-menu_position-left mm-menu_theme-black"
        style={{ zIndex: 101 }}
      >
        {showMenu && (
          <div className="mm-panels">
            <div className="mm-panel mm-panel_opened">
              <div className="mm-navbar mm-navbar_sticky">
                <span className="mm-navbar__title">{t("Menu")}</span>
              </div>

              <ul className="navigation mm-listview">
                {headerLinks.map((item, index) => (
                  <li
                    key={index}
                    className={`mm-listitem ${isActive(item.href) ? "current" : ""
                      }`}
                  >
                    <Link
                      href={item.href}
                      className="mm-listitem__text"
                      onClick={closeMenu}
                    >
                      {t(item.title)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <div
        className="overlay-mobile"
        id="mobileOverlay"
        onClick={closeMenu}
      />
    </>
  );
}
