"use client";
import React from "react";
import Nav from "./Nav";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { supportedLanguages } from "@/locales";
import { useLanguage } from "@/context/LanguageContext";


const headerSocialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/carrentalmontenegro?igsh=dXEzcGhhY25jM3lv",
    iconClass: "fa-brands fa-instagram",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Rent-a-Car-Montenegro/61578262611560/?rdid=NfaRO67sVlHn1I9D&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FirRkUgda%2F%3Fref%3D1",
    iconClass: "fa-brands fa-facebook-f",
  },
];

export default function Header1({
  headerClass = "header-style-v1 header-default",
  white = false
}) {
  const { t, locale, setLocale } = useLanguage();
  return (
    <header className={`boxcar-header  ${headerClass}`}>
      <div className="header-inner">
        <div className="inner-container">
          {/* Main box */}
          <div className="c-box">
            <div className="logo-inner">
              <div className="logo">
                <Link href={`/`}>
                  {white ? (
                    <Image
                      alt=""
                      title="Luxar rent a car"
                      src="/images/logo2.png"
                      width="108"
                      height="26"
                    />
                  ) : (
                    <Image
                      alt=""
                        title="Luxar rent a car"
                      src="/images/logo.webp"
                      width={108}
                      height={26}
                    />
                  )}
                </Link>
              </div>

            </div>
            {/*Nav Box*/}
            <div className="nav-out-bar">
              <nav className="nav main-menu">
                <ul className="navigation" id="navbar">
                  <Nav />
                </ul>
              </nav>
              {/* Main Menu End*/}
            </div>
            <div className="right-box">
              <ul className="header-social" aria-label="Social links">
                {headerSocialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className={social.iconClass} />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="language-dropdown">
                <select
                  value={locale}
                  onChange={(event) => setLocale(event.target.value)}
                  aria-label={t("Select language")}
                >
                  {supportedLanguages.map((language) => (
                    <option
                      key={language.code}
                      value={language.code}
                      title={language.label}
                    >
                      {language.flag ? `${language.flag} ` : ""}
                      {language.code.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mobile-navigation">
                <a href="#nav-mobile" title="">
                  {/* <i className="fa fa-bars"></i> */}
                  <svg
                    width={22}
                    height={11}
                    viewBox="0 0 22 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width={22} height={2} fill="currentColor" />
                    <rect y={9} width={22} height={2} fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          {/* Mobile Menu  */}
        </div>
      </div>
      {/* Header Search */}
      {/* <div className="search-popup">
        <span className="search-back-drop" />
        <button className="close-search">
          <span className="fa fa-times" />
        </button>
        <div className="search-inner">
          <form onSubmit={(e) => e.preventDefault()} method="post">
            <div className="form-group">
              <input
                type="search"
                name="search-field"
                defaultValue=""
                placeholder="Search..."
                required
              />
              <button type="submit">
                <i className="fa fa-search" />
              </button>
            </div>
          </form>
        </div>
      </div> */}
      {/* End Header Search */}
    </header>
  );
}
