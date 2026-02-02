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
    src: "/images/placeholder.svg", // City-ready compact rental
    alt: "Blue compact hatchback parked in the city",
    className: "item2",
  },
  {
    id: 3,
    type: "image",
    src: "/images/placeholder.svg", // Silver SUV in sunlight
    alt: "Silver SUV ready for weekend adventures",
    className: "item3",
  },
  {
    id: 4,
    type: "image",
    src: "/images/placeholder.svg", // Premium sedan front
    alt: "Premium sedan from our downtown fleet",
    className: "item4",
  },
  {
    id: 5,
    type: "image",
    src: "/images/placeholder.svg", // Dealership exterior
    alt: "Dealership lot with ready-to-rent vehicles",
    className: "item5",
  },
  {
    id: 6,
    type: "image",
    src: "/images/placeholder.svg", // Convertible by the coast
    alt: "Convertible poised for a scenic rental drive",
    className: "item6",
  },
];

export default function About() {
  const { t } = useLanguage();
  return (
    <>
      <div className="upper-box">
        <div className="boxcar-container">
          <div className="row wow fadeInUp">
            <div className="col-lg-6 col-md-6 col-sm-12">
              <div className="boxcar-title">
                <ul className="breadcrumb">
                  <li>
                    <Link href={`/`}>{t("Home")}</Link>
                  </li>
                  <li>
                    <span>{t("About us")}</span>
                  </li>
                </ul>
                <h2>{t("About us")}</h2>
                <div className="text">
                  {t(
                    "We make renting a car simple, flexible, and transparent."
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 col-sm-12">
              <div className="content-box">
                <div className="text">
                  {t(
                    "From quick online booking to easy pickup and return, we focus on a smooth rental experience with no hidden costs."
                  )}
                </div>
                <div className="text">
                  {t(
                    "Our fleet ranges from compact city cars to spacious SUVs, all regularly serviced and ready for the road."
                  )}
                </div>
                <div className="text">
                  {t(
                    "Whether you need a car for a day, a week, or longer, we tailor the rental to your trip and budget."
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
