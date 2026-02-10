"use client";
import React from "react";
import Accordion from "../common/Accordion";
import { useLanguage } from "@/context/LanguageContext";
import Link from "@/components/common/LocalizedLink";

export default function Faq2() {
  const { t } = useLanguage();

  return (
    <section className="faq-inner-section layout-radius">
      <div className="boxcar-container">
        <div className="boxcar-title-three wow fadeInUp">
          <ul className="breadcrumb">
            <li>
              <Link href={`/`}>{t("Home")}</Link>
            </li>
            <li>
              <span>{t("FAQ")}</span>
            </li>
          </ul>
          <h2>{t("FAQ")}</h2>
        </div>
      </div>
      {/* faq-section */}
      <div className="faqs-section pt-0">
        <div className="inner-container">
          {/* FAQ Column */}
          <div className="faq-column wow fadeInUp" data-wow-delay="400ms">
            <div className="inner-column">
              <div className="boxcar-title text-center">
                <h2 className="title">{t("General information")}</h2>
              </div>
              <ul className="widget-accordion wow fadeInUp">
                {/*Block*/}
                <Accordion />
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* End faqs-section */}
      {/* faq-section */}
      <div className="faqs-section">
        <div className="inner-container">
          {/* FAQ Column */}
          <div className="faq-column wow fadeInUp" data-wow-delay="400ms">
            <div className="inner-column">
              <div className="boxcar-title text-center">
                <h2 className="title">{t("Payment")}</h2>
              </div>
              <ul className="widget-accordion wow fadeInUp">
                <Accordion />
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* End faqs-section */}
    </section>
  );
}
