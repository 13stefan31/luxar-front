import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import Location from "@/components/otherPages/Location";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";

export const generateMetadata = createLocalizedMetadata({
  titleKey: "meta.locations.title",
  titleFallback: "Car Rental Pickup & Dropoff Locations in Montenegro | LUXAR TRADE",
  descriptionKey: "meta.locations.description",
  descriptionFallback: "Find LUXAR TRADE pickup and return locations across Montenegro. Flexible door-to-door delivery also available.",
  appendBrandSuffix: false,
});

export default function DealerPage() {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Location />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
