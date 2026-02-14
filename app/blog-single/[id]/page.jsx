import BlogsSingle from "@/components/blogs/BlogsSingle";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { allBlogs } from "@/data/blogs";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";
import Blogs from "@/components/homes/home-1/Blogs";

const getBlogItem = (id) =>
  allBlogs.find((item) => String(item.id) === String(id)) || allBlogs[0];

export async function generateMetadata({ params, searchParams }) {
  const blogItem = getBlogItem(params?.id);
  const titleKey = blogItem?.title || "Blog";
  const descriptionKey =
    blogItem?.description || "Latest from our blog";
  const metadataBuilder = createLocalizedMetadata({
    titleKey,
    titleFallback: blogItem?.title || "Blog",
    descriptionKey,
    descriptionFallback:
      blogItem?.description || "Latest from our blog",
  });
  const metadata = await metadataBuilder({ searchParams });
  const imageSrc =
    blogItem?.imageSrc || blogItem?.src || blogItem?.imgSrc || null;
  if (!imageSrc) {
    return metadata;
  }
  return {
    ...metadata,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: "article",
      images: [
        {
          url: imageSrc,
          alt: blogItem?.title || "Blog",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: [imageSrc],
    },
  };
}
export default function BlogSinglePage({ params }) {
  const blogItem = getBlogItem(params?.id);
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <BlogsSingle blogItem={blogItem} />
      <Blogs />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
