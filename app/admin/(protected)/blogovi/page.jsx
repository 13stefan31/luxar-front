import BlogList from "@/components/admin/BlogList";
import HeaderDashboard from "@/components/headers/HeaderDashboard";
import React from "react";

export const metadata = {
  title: "Blog || LUXAR TRADE - rent a car",
  description: "LUXAR TRADE - rent a car",
};

export default function BlogListPage() {
  return (
    <div className="admin-shell">
      <HeaderDashboard />
      <BlogList />
    </div>
  );
}
