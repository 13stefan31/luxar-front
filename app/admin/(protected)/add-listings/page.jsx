import AddListings from "@/components/admin/AddListings";

import HeaderDashboard from "@/components/headers/HeaderDashboard";
import React from "react";

export const metadata = {
  title: "Novo vozilo || LUXAR TRADE - rent a car",
  description: "LUXAR TRADE - rent a car",
};
export default function AddListingsPage() {
  return (
    <>
      <div className="admin-shell">
        <HeaderDashboard />

        <AddListings />
      </div>
    </>
  );
}
