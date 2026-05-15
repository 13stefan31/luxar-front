import BlogFromApi from "@/components/blogs/BlogFromApi";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { getPreferredLocale } from "@/lib/metadataHelper";
import { fetchBlog, normalizeInventoryImageUrl } from "@/lib/inventoryApi";
import { headers } from "next/headers";
import { localizePath, supportedLocales, defaultLocale } from "@/lib/i18nRoutes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxartrade.me";
const HREFLANG = { en: "en", me: "sr-ME", ru: "ru" };
import React from "react";
import Blogs from "@/components/homes/home-1/Blogs";

export async function generateMetadata({ params }) {
  const locale = getPreferredLocale();
  const internalPath = headers().get("x-pathname");
  let title = "Blog | LUXAR TRADE";
  let description = "";
  let ogImage = "/images/logo.png";
  try {
    const blog = await fetchBlog(params?.id, locale);
    if (blog?.title) title = `${blog.title} | LUXAR TRADE`;
    if (blog?.description) description = String(blog.description).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
    const rawImage = blog?.coverImagePath || blog?.generatedCoverImage;
    if (rawImage) ogImage = normalizeInventoryImageUrl(rawImage);
  } catch {
    // fallback to defaults
  }
  const pageUrl = internalPath ? `${SITE_URL}${internalPath}` : SITE_URL;
  const languages = internalPath
    ? Object.fromEntries([
        ...supportedLocales.map((l) => [HREFLANG[l] || l, `${SITE_URL}${localizePath(internalPath, l)}`]),
        ["x-default", `${SITE_URL}${localizePath(internalPath, defaultLocale)}`],
      ])
    : {};
  return {
    title,
    description,
    ...(internalPath && { alternates: { languages } }),
    openGraph: {
      type: "article",
      url: pageUrl,
      title,
      description,
      siteName: "LUXAR TRADE",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function BlogSinglePage({ params }) {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <BlogFromApi blogId={params?.id} />
      <Blogs />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
