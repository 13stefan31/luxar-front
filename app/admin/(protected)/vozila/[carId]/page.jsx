import React from "react";
import Link from "next/link";
import HeaderDashboard from "@/components/headers/HeaderDashboard";
import Sidebar from "@/components/admin/Sidebar";
import CarDetailsTabs from "@/components/admin/CarDetailsTabs";

export const metadata = {
  title: "Vozila - detalji vozila",
  description: "Detaljan pregled vozila i varijacija.",
};

export default function CarDetailPage({ params }) {
  const { carId } = params;
  return (
    <>
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
                    <Link href="/admin/vozila">Vozila</Link>
                  </li>
                  <li>
                    <span>Detalji #{carId}</span>
                  </li>
                </ul>
                <h2 className="title">Detalji vozila</h2>
                <CarDetailsTabs carId={carId} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
