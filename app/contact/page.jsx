import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Contact from "@/components/otherPages/Contact";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";

export const generateMetadata = createLocalizedMetadata({
  titleKey: "meta.contact.title",
  titleFallback: "Contact LUXAR TRADE – Car Rental Montenegro",
  descriptionKey: "meta.contact.description",
  descriptionFallback: "Get in touch with LUXAR TRADE for rental inquiries, booking assistance, or general information.",
  appendBrandSuffix: false,
});

export default function ContactPage() {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Contact />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
