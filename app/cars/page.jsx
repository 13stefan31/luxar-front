import Cars from "@/components/carListings/Cars";
import Sidebar from "@/components/carListings/Sidebar";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";

export const generateMetadata = createLocalizedMetadata({
  titleKey: "meta.cars.title",
  titleFallback: "Rent a Car in Montenegro – Browse Our Fleet",
  descriptionKey: "meta.cars.description",
  descriptionFallback: "Browse our full fleet of rental cars in Montenegro. Easy online booking.",
  appendBrandSuffix: false,
});

export default function CarsPage() {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Sidebar />
      <Cars />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
