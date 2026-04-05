import BlogForm from "@/components/admin/BlogForm";
import HeaderDashboard from "@/components/headers/HeaderDashboard";
import Sidebar from "@/components/admin/Sidebar";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Uredi blog || LUXAR TRADE - rent a car",
};

export default function EditBlogPage({ params }) {
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
                <li><Link href="/admin/dashboard">Dashboard</Link></li>
                <li><Link href="/admin/blogovi">Blog</Link></li>
                <li><span>Uredi #{id}</span></li>
              </ul>
              <BlogForm blogId={id} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
