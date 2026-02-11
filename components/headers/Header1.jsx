"use client";
import React, { useState } from "react";
import Nav from "./Nav";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { carItemsSearch } from "@/data/cars";
import { supportedLanguages } from "@/locales";
import { useLanguage } from "@/context/LanguageContext";
import { getCarDetailHref } from "@/lib/carPaths";

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
  const [searchQuery, setSearchQuery] = useState("");
  const { t, locale, setLocale } = useLanguage();

  const handleFocus = () => {
    document.getElementById("box-content-search").classList.add("active");
    document
      .getElementById("box-content-search")
      .closest(".layout-search")
      .classList.add("active");
  };

  const handleBlur = () => {
    document.getElementById("box-content-search").classList.remove("active");
    document
      .getElementById("box-content-search")
      .closest(".layout-search")
      .classList.remove("active");
  };
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
                      src="/images/logo.png"
                      width={108}
                      height={26}
                    />
                  )}
                </Link>
              </div>

              <div className="layout-search">
                {/* <div className="search-box">
                  <svg
                    className="icon"
                    width={16}
                    height={16}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.29301 1.2876C3.9872 1.2876 1.29431 3.98048 1.29431 7.28631C1.29431 10.5921 3.9872 13.2902 7.29301 13.2902C8.70502 13.2902 10.0036 12.7954 11.03 11.9738L13.5287 14.4712C13.6548 14.5921 13.8232 14.6588 13.9979 14.657C14.1725 14.6552 14.3395 14.5851 14.4631 14.4617C14.5867 14.3382 14.6571 14.1713 14.6591 13.9967C14.6611 13.822 14.5947 13.6535 14.474 13.5272L11.9753 11.0285C12.7976 10.0006 13.293 8.69995 13.293 7.28631C13.293 3.98048 10.5988 1.2876 7.29301 1.2876ZM7.29301 2.62095C9.87824 2.62095 11.9584 4.70108 11.9584 7.28631C11.9584 9.87153 9.87824 11.9569 7.29301 11.9569C4.70778 11.9569 2.62764 9.87153 2.62764 7.28631C2.62764 4.70108 4.70778 2.62095 7.29301 2.62095Z"
                      fill="white"
                    />
                  </svg>
                  <input
                    type="search"
                    placeholder={t("searchPlaceholder")}
                    className="show-search"
                    name="name"
                    tabIndex={2}
                    defaultValue=""
                    aria-required="true"
                    required
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div> */}
                <div className="box-content-search" id="box-content-search">
                  <ul className="box-car-search">
                    {carItemsSearch
                      .filter((elm) =>
                        elm.title
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((car) => (
                        <li key={car.id}>
                          <Link
                            href={getCarDetailHref(car)}
                            className="car-search-item"
                          >
                            <div className="box-img">
                              <Image
                                alt="img"
                                src={car.imgSrc}
                                width={70}
                                height={70}
                              />
                            </div>
                            <div className="info">
                              <p className="name">{car.title}</p>
                              <span className="price">${car.newPrice}</span>
                            </div>
                          </Link>
                        </li>
                      ))}
                  </ul>
                  <Link
                    href={getCarDetailHref(carItemsSearch[0] ?? { id: 1 })}
                    className="btn-view-search"
                  >
                  {t("viewDetails")}
                  <svg
                      width={14}
                      height={14}
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_3114_6864)">
                        <path
                          d="M13.6109 0H5.05533C4.84037 0 4.66643 0.173943 4.66643 0.388901C4.66643 0.603859 4.84037 0.777802 5.05533 0.777802H12.6721L0.113697 13.3362C-0.0382246 13.4881 -0.0382246 13.7342 0.113697 13.8861C0.18964 13.962 0.289171 14 0.388666 14C0.488161 14 0.587656 13.962 0.663635 13.8861L13.222 1.3277V8.94447C13.222 9.15943 13.3959 9.33337 13.6109 9.33337C13.8259 9.33337 13.9998 9.15943 13.9998 8.94447V0.388901C13.9998 0.173943 13.8258 0 13.6109 0Z"
                          fill="currentColor"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_3114_6864">
                          <rect width={14} height={14} fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </Link>
                </div>
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
