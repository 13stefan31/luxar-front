import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import TripPlanner from "@/components/otherPages/TripPlanner";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";

export const generateMetadata = createLocalizedMetadata({
  titleKey: "meta.tripPlanner.title",
  titleFallback: "Plan Your Montenegro Road Trip | LUXAR TRADE",
  descriptionKey: "meta.tripPlanner.description",
  descriptionFallback: "Use our trip planner to map out your Montenegro road trip. Choose pickup location, dates, and vehicle type.",
  appendBrandSuffix: false,
});

export default function TripPlannerPage() {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <TripPlanner />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
