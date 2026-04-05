import React from "react";
import Link from "next/link";
import HeaderDashboard from "@/components/headers/HeaderDashboard";
import Sidebar from "@/components/admin/Sidebar";
import ReservationDetail from "@/components/admin/ReservationDetail";

export const metadata = {
  title: "Rezervacija - detalji",
  description: "Detaljan pregled rezervacije.",
};

export default function ReservationDetailPage({ params }) {
  const { id } = params;
  return (
    <div className="admin-shell">
      <HeaderDashboard />
      <section className="dashboard-widget">
        <div className="right-box">
          <Sidebar />
          <div className="content-column">
            <div className="inner-column">
              <ul className="breadcrumb">
                <li>
                  <Link href="/admin/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link href="/admin/rezervacije">Rezervacije</Link>
                </li>
                <li>
                  <span>Detalji #{id}</span>
                </li>
              </ul>
              <ReservationDetail reservationId={id} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
