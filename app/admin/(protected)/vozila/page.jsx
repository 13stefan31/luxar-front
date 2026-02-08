import MyListings from "@/components/admin/MyListings";
import Footer1 from "@/components/footers/Footer1";
import HeaderDashboard from "@/components/headers/HeaderDashboard";
import React from "react";

export const metadata = {
  title: "Vozila || LUXAR TRADE - rent a car",
  description: "LUXAR TRADE - rent a car",
};

export default function MyListingsPage() {
  return (
    <>
      <div className="admin-shell">
        <HeaderDashboard />

        <MyListings />
        <Footer1 parentClass="boxcar-footer footer-style-one v2" />
      </div>
    </>
  );
}
