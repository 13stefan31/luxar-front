import BlogsSingle from "@/components/blogs/BlogsSingle";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { allBlogs } from "@/data/blogs";
import React from "react";
import Blogs from "@/components/homes/home-1/Blogs";

export const metadata = {
  title: "Blog Single || LUXAR TRADE - rent a car",
  description: "LUXAR TRADE - rent a car",
};
export default function BlogSinglePage({ params }) {
  const blogItem =
    allBlogs.filter((elm) => elm.id == params.id)[0] || allBlogs[0];
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <BlogsSingle blogItem={blogItem} />
      <Blogs />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
