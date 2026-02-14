import BlogsSingle from "@/components/blogs/BlogsSingle";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { allBlogs } from "@/data/blogs";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";
import Blogs from "@/components/homes/home-1/Blogs";

const getBlogItem = () =>
  allBlogs.find((item) => item.slug === "montenegro-road-trip") || allBlogs[0];

export async function generateMetadata({ searchParams }) {
  const blogItem = getBlogItem();
  const metadataBuilder = createLocalizedMetadata({
    titleKey: "meta.montenegroRoadTrip.title",
    titleFallback:
      "Montenegro Road Trip: Renting a Car To Experience Montenegro in 2026",
    descriptionKey: "meta.montenegroRoadTrip.description",
    descriptionFallback:
      "Why public transport will limit you + best regions to explore by car",
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
          alt: metadata.title,
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

export default function MontenegroRoadTripPage() {
  const blogItem = getBlogItem();
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <BlogsSingle blogItem={blogItem} />
      <Blogs />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
