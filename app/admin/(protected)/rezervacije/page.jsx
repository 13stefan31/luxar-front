import Reservations from "@/components/admin/Reservations";
import HeaderDashboard from "@/components/headers/HeaderDashboard";
import React from "react";

export const metadata = {
  title: "Rezervacije || LUXAR TRADE - rent a car",
  description: "LUXAR TRADE - rent a car",
};

export default function ReservationsPage() {
  return (
    <div className="admin-shell">
      <HeaderDashboard />
      <Reservations />
    </div>
  );
}
