import BlogsSingle from "@/components/blogs/BlogsSingle";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { allBlogs } from "@/data/blogs";
import React from "react";
import Blogs from "@/components/homes/home-1/Blogs";

export const metadata = {
  title: "Montenegro Road Trip: Renting a Car To Experience Montenegro in 2026",
  description: "Why public transport will limit you + best regions to explore by car",
};

export default function MontenegroRoadTripPage() {
  const blogItem =
    allBlogs.find((item) => item.slug === "montenegro-road-trip") ||
    allBlogs[0];
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <BlogsSingle blogItem={blogItem} />
      <Blogs />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
