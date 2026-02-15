import Dashboard from "@/components/admin/Dashboard";
import HeaderDashboard from "@/components/headers/HeaderDashboard";
import React from "react";

export const metadata = {
  title: "Admin Dashboard || LUXAR TRADE - rent a car",
  description: "Admin area for LUXAR TRADE",
};
export default function AdminDashboardPage() {
  return (
    <>
      <div className="admin-shell">
        <HeaderDashboard />

        <Dashboard />
      </div>
    </>
  );
}
