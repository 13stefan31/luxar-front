import AdminReservationForm from "@/components/admin/AdminReservationForm";
import HeaderDashboard from "@/components/headers/HeaderDashboard";
import Sidebar from "@/components/admin/Sidebar";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Nova rezervacija || LUXAR TRADE - rent a car",
};

export default function NewReservationPage() {
  return (
    <div className="admin-shell">
      <HeaderDashboard />
      <section className="dashboard-widget">
        <div className="right-box">
          <Sidebar />
          <div className="content-column">
            <div className="inner-column">
              <ul className="breadcrumb">
                <li><Link href="/admin/dashboard">Dashboard</Link></li>
                <li><Link href="/admin/rezervacije">Rezervacije</Link></li>
                <li><span>Nova rezervacija</span></li>
              </ul>
              <h2 className="title">Nova rezervacija</h2>
              <AdminReservationForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
