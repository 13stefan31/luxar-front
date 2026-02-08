"use client";

import { headerLinks } from "@/data/menu";
import Link from "@/components/common/LocalizedLink";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { socialMediaLinks } from "@/data/footerLinks";
import { useLanguage } from "@/context/LanguageContext";
import { getInternalPathname } from "@/lib/i18nRoutes";

export default function MobileMenu() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  const { t } = useLanguage();

  const getSocialLabel = (iconClass = "") => {
    const normalized = iconClass.toLowerCase();
    if (normalized.includes("facebook")) return "Facebook";
    if (normalized.includes("instagram")) return "Instagram";
    if (normalized.includes("twitter") || normalized.includes("x-")) return "X";
    if (normalized.includes("linkedin")) return "LinkedIn";
    if (normalized.includes("tiktok")) return "TikTok";
    if (normalized.includes("youtube")) return "YouTube";
    return "Social link";
  };

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
                <span className="mm-navbar__title">
                  <Link
                    href="/"
                    className="mobile-menu-logo"
                    onClick={closeMenu}
                  >
                    <Image
                      alt="Luxar rent a car"
                      title="Luxar rent a car"
                      src="/images/logo.png"
                      width={108}
                      height={26}
                      className="mobile-menu-logo__img"
                    />
                  </Link>
                </span>
              </div>

              <div className="mobile-menu-panel">
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

                <ul className="mobile-menu-social" aria-label="Social links">
                  {socialMediaLinks.map((social, index) => (
                    <li key={index}>
                      <a
                        href={social.link}
                        aria-label={getSocialLabel(social.iconClass)}
                      >
                        <i className={social.iconClass} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
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
