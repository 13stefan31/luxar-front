import BlogsSingle from "@/components/blogs/BlogsSingle";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { createLocalizedMetadata } from "@/lib/metadataHelper";
import React from "react";
import Blogs from "@/components/homes/home-1/Blogs";

const BLOG_ITEM = {
  id: 4,
  title: "Montenegro Road Trip: Renting a Car To Experience Montenegro in 2026",
  slug: "montenegro-road-trip",
  description: "Why public transport will limit you + best regions to explore by car",
  src: "/images/banner/IMG_0859.JPG",
  imageSrc: "/images/banner/IMG_0859.JPG",
  date: "11.02.2026",
  author: "Admin",
};

export async function generateMetadata({ searchParams }) {
  const metadataBuilder = createLocalizedMetadata({
    titleKey: "meta.montenegroRoadTrip.title",
    titleFallback:
      "Montenegro Road Trip: Renting a Car To Experience Montenegro in 2026",
    descriptionKey: "meta.montenegroRoadTrip.description",
    descriptionFallback:
      "Why public transport will limit you + best regions to explore by car",
  });
  const metadata = await metadataBuilder({ searchParams });
  return {
    ...metadata,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: "article",
      images: [{ url: BLOG_ITEM.imageSrc, alt: metadata.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: metadata.title,
      description: metadata.description,
      images: [BLOG_ITEM.imageSrc],
    },
  };
}

export default function MontenegroRoadTripPage() {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <BlogsSingle blogItem={BLOG_ITEM} />
      <Blogs />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
