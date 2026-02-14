"use client";

import React from "react";
import Image from "next/image";
import Link from "@/components/common/LocalizedLink";
import { useLanguage } from "@/context/LanguageContext";
const galleryItems = [
  {
    id: 1,
    type: "text",
    title: "45",
    subtitle: "Years in car rental",
    className: "item1",
  },
  {
    id: 2,
    type: "image",
    src: "/images/banner/IMG_0874.jpg",  
    alt: "Luxar - Rent a Car Crna Gora",
    className: "item2",
  },
  {
    id: 3,
    type: "image",
    src: "/images/banner/IMG_0875.jpg",
    alt: "Luxar - Rent a Car Crna Gora",
    className: "item3",
  },
  {
    id: 4,
    type: "image",
    src: "/images/banner/IMG_0876.jpg",
    alt: "Luxar - Rent a Car Crna Gora",
    className: "item4",
  },
  {
    id: 5,
    type: "image",
    src: "/images/banner/IMG_0877.jpg",
    alt: "Luxar - Rent a Car Crna Gora",
    className: "item5",
  },
  {
    id: 6,
    type: "image",
    src: "/images/banner/IMG_0878.jpg",
    alt: "Luxar - Rent a Car Crna Gora",
    className: "item6",
  },
];

export default function About() {
  const { t, locale } = useLanguage();
  const brandByLocale = {
    en: "Luxar",
    me: "Luxar",
    ru: "Luxar",
  };
  const brand = brandByLocale[locale] || "Luxar";
  const headingTemplate = t("About {brand} - Car Rental Montenegro");
  const headingParts = headingTemplate.split("{brand}");
  return (
    <>
      <div className="upper-box">
        <div className="boxcar-container">
          <div className="row wow fadeInUp">
            <div className="col-lg-12 col-md-12 col-sm-12">
              <div className="boxcar-title">
                <ul className="breadcrumb">
                  <li>
                    <Link href={`/`}>{t("Home")}</Link>
                  </li>
                  <li>
                    <span>{t("About us")}</span>
                  </li>
                </ul>
                <h1>
                  {headingParts.length === 2 ? (
                    <>
                      {headingParts[0]}
                      <span className="brand-gold-text">{brand}</span>
                      {headingParts[1]}
                    </>
                  ) : (
                    headingTemplate
                  )}
                </h1>
                
              </div>
            </div>
            <div className="col-lg-12 col-md-12 col-sm-12">
              <div className="">
                <div className="text">
                  {t(
                    "Luxar - Car Rental Montenegro offers flexible rental packages, transparent pricing with no hidden costs, and professionally maintained vehicles to ensure a safe and reliable experience."
                  )}
                </div>
                <div className="text">
                  {t(
                    "With country-wide delivery, airport pickup and dropoff, and easy booking, we make renting a car in Montenegro simple and convenient wherever your journey begins."
                  )}
                </div>
                <div className="text">
                  {t(
                    "As a family-owned local business, we combine personal service and local expertise to help you explore Montenegro's coast, mountains, and everything in between with confidence."
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* gallery-sec */}
      <div className="galler-section">
        <div className="boxcar-container">
          <div className="galleryGrid galler-section">
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className={`exp-block  galleryItem ${item.className} ${
                  item.type === "image" ? "hasOverlay" : ""
                }`}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                {item.type === "text" ? (
                  <div className="inner-box">
                    <div className="exp-box">
                      <h2 className="title">{item.title}</h2>
                      <div className="text">
                        {item.subtitle ? t(item.subtitle) : ""}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="galleryImage"
                    priority={index < 3}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
