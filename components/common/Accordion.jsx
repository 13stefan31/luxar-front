"use client";
import { accordionData } from "@/data/faqs";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlightText = (text, query) => {
  const normalized = query.trim();
  if (!normalized) {
    return text;
  }
  const escaped = escapeRegExp(normalized);
  if (!escaped) {
    return text;
  }
  const parts = String(text).split(new RegExp(`(${escaped})`, "gi"));
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={`${index}-${part}`} className="faq-highlight">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export default function Accordion({ faqs = accordionData, highlightQuery = "" }) {
  const { t } = useLanguage();
  const normalizedQuery = highlightQuery.trim();

  return (
    <>
      {faqs.map((item, index) => (
        <li key={index} className="accordion block">
          <h2 className="acc-btn">
            {highlightText(t(item.question), normalizedQuery)}
          </h2>
          <div className="acc-content current">
            <div className="content">
              <p className="text">
                {highlightText(t(item.answer), normalizedQuery)}
              </p>
            </div>
          </div>
        </li>
      ))}
    </>
  );
}
