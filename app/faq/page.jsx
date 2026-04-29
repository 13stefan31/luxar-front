import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Faq2 from "@/components/otherPages/Faq2";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";

export const generateMetadata = createLocalizedMetadata({
  titleKey: "meta.faq.title",
  titleFallback: "FAQ – Car Rental Montenegro | LUXAR TRADE",
  descriptionKey: "meta.faq.description",
  descriptionFallback: "Answers to common questions about renting a car in Montenegro — deposits, pickup locations, road conditions, and more.",
  appendBrandSuffix: false,
});

export default function FaqPage() {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Faq2 />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
