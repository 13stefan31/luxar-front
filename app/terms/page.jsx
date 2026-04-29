import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Terms from "@/components/otherPages/Terms";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";

export const generateMetadata = createLocalizedMetadata({
  titleKey: "meta.terms.title",
  titleFallback: "Rental Terms & Conditions | LUXAR TRADE Montenegro",
  descriptionKey: "meta.terms.description",
  descriptionFallback: "Read the full rental terms and conditions for LUXAR TRADE in Montenegro.",
  appendBrandSuffix: false,
});

export default function TermsPage() {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Terms />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
