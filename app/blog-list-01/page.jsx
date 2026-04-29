import Blogs from "@/components/homes/home-1/Blogs";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";

export const generateMetadata = createLocalizedMetadata({
  titleKey: "meta.blog.title",
  titleFallback: "Car Rental Tips & Montenegro Travel Blog | LUXAR TRADE",
  descriptionKey: "meta.blog.description",
  descriptionFallback: "Travel guides, car rental tips, and road trip inspiration for Montenegro.",
  appendBrandSuffix: false,
});

export default function BlogListingPage1() {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Blogs showBreadcrumb />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
