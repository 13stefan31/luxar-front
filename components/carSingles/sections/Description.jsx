import React, { useMemo } from "react";
import { useLanguage } from "@/context/LanguageContext";

const DESCRIPTION_FIELDS_BY_LOCALE = {
  en: ["descriptionEn", "description_en"],
  me: ["descriptionMne", "description_mne"],
  ru: ["descriptionRu", "description_ru"],
};

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return "";
  }
  const text = String(value).trim();
  return text;
};

const resolveDescription = ({ detail, locale }) => {
  const localeFields = DESCRIPTION_FIELDS_BY_LOCALE[locale] || [];
  for (const key of localeFields) {
    const normalized = normalizeText(detail?.[key]);
    if (normalized) {
      return normalized;
    }
  }
  return "";
};

const splitDescription = (value) => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return [];
  }
  return normalized
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.replace(/\n/g, " ").trim())
    .filter(Boolean);
};

export default function Description({ detail = {} }) {
  const { t, locale } = useLanguage();
  const description = useMemo(
    () => resolveDescription({ detail, locale }),
    [detail, locale]
  );
  const paragraphs = useMemo(() => splitDescription(description), [description]);
  const title = t("Description");

  if (!paragraphs.length) {
    return null;
  }

  return (
    <>
      <h4 className="title">{title}</h4>
      {paragraphs.map((paragraph, index) => (
        <div key={`description-${index}`} className={index ? "text" : "text two"}>
          {paragraph}
        </div>
      ))}
    </>
  );
}
