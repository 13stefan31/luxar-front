"use client";
import React, { useMemo, useState } from "react";
import Accordion from "../common/Accordion";
import { useLanguage } from "@/context/LanguageContext";
import Link from "@/components/common/LocalizedLink";
import { accordionData } from "@/data/faqs";

export default function Faq2() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredFaqs = useMemo(() => {
    if (!normalizedQuery) {
      return accordionData;
    }
    return accordionData.filter((item) => {
      const question = t(item.question).toLowerCase();
      const answer = t(item.answer).toLowerCase();
      return (
        question.includes(normalizedQuery) || answer.includes(normalizedQuery)
      );
    });
  }, [normalizedQuery, t]);

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
          <div className="search-box">
            <input
              type="text"
              placeholder={t("Search FAQs")}
              className="search-field"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label={t("Search FAQs")}
            />
            <span className="icon" aria-hidden="true">
              <svg
                width={15}
                height={15}
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_200_8303)">
                  <path
                    d="M6.60568 0C2.96341 0 0 2.96341 0 6.60568C0 10.2482 2.96341 13.2114 6.60568 13.2114C10.2482 13.2114 13.2114 10.2482 13.2114 6.60568C13.2114 2.96341 10.2482 0 6.60568 0ZM6.60568 11.9919C3.63577 11.9919 1.21951 9.57562 1.21951 6.60571C1.21951 3.6358 3.63577 1.21951 6.60568 1.21951C9.57559 1.21951 11.9919 3.63577 11.9919 6.60568C11.9919 9.57559 9.57559 11.9919 6.60568 11.9919Z"
                    fill="#051036"
                  />
                  <path
                    d="M14.822 13.9591L11.326 10.4632C11.0878 10.225 10.702 10.225 10.4638 10.4632C10.2256 10.7012 10.2256 11.0874 10.4638 11.3254L13.9598 14.8214C14.0789 14.9405 14.2348 15 14.3909 15C14.5468 15 14.7029 14.9405 14.822 14.8214C15.0602 14.5834 15.0602 14.1972 14.822 13.9591Z"
                    fill="#051036"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_200_8303">
                    <rect width={15} height={15} fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
          </div>
          {normalizedQuery && filteredFaqs.length === 0 ? (
            <div className="text text-center">{t("No results.")}</div>
          ) : null}
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
                <Accordion faqs={filteredFaqs} highlightQuery={query} />
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
                <Accordion faqs={filteredFaqs} highlightQuery={query} />
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* End faqs-section */}
    </section>
  );
}
