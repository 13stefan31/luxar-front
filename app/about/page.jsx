import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Features from "@/components/homes/home-1/Features";
import Features2 from "@/components/homes/home-1/Features2";
import About from "@/components/otherPages/About";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";

export const generateMetadata = createLocalizedMetadata({
  titleKey: "meta.about.title",
  titleFallback: "About LUXAR TRADE – Car Rental Montenegro",
  descriptionKey: "meta.about.description",
  descriptionFallback: "LUXAR TRADE offers flexible rental packages, transparent pricing, and professionally maintained vehicles. Country-wide delivery and easy online booking.",
  appendBrandSuffix: false,
});

export default function AboutPage() {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <section className="about-inner-one layout-radius">
        <About />
        <Features2 />
        <Features />
      </section>
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
