import Saved from "@/components/admin/Saved";

import HeaderDashboard from "@/components/headers/HeaderDashboard";
import React from "react";

export const metadata = {
  title: "Saved || LUXAR TRADE - rent a car",
  description: "LUXAR TRADE - rent a car",
};
export default function SavedPage() {
  return (
    <>
      <div className="admin-shell">
        <HeaderDashboard />

        <Saved />
      </div>
    </>
  );
}
