import BlogFromApi from "@/components/blogs/BlogFromApi";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";
import Blogs from "@/components/homes/home-1/Blogs";

export async function generateMetadata({ params, searchParams }) {
  const metadataBuilder = createLocalizedMetadata({
    titleKey: "Blog",
    titleFallback: "Blog",
    descriptionKey: "Latest from our blog",
    descriptionFallback: "Latest from our blog",
  });
  return metadataBuilder({ searchParams });
}

export default function BlogSingleSlugPage({ params }) {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <BlogFromApi blogId={params?.id} />
      <Blogs />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
