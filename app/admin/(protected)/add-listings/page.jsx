import AddListings from "@/components/admin/AddListings";
import Footer1 from "@/components/footers/Footer1";

import HeaderDashboard from "@/components/headers/HeaderDashboard";
import React from "react";

export const metadata = {
  title: "Novo vozilo || LUXAR TRADE - rent a car",
  description: "LUXAR TRADE - rent a car",
};
export default function AddListingsPage() {
  return (
    <>
      <div style={{ background: "var(--theme-color-dark)" }}>
        <HeaderDashboard />

        <AddListings />
        <Footer1 parentClass="boxcar-footer footer-style-one v2" />
      </div>
    </>
  );
}
