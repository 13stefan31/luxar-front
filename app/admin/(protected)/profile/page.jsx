import Profile from "@/components/admin/Profile";

import HeaderDashboard from "@/components/headers/HeaderDashboard";
import React from "react";

export const metadata = {
  title: "Profile || LUXAR TRADE - rent a car",
  description: "LUXAR TRADE - rent a car",
};
export default function ProfilePage() {
  return (
    <>
      <div className="admin-shell">
        <HeaderDashboard />

        <Profile />
      </div>
    </>
  );
}
