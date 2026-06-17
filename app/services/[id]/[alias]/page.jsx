import BlogFromApi from "@/components/blogs/BlogFromApi";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { getPreferredLocale } from "@/lib/metadataHelper";
import { fetchBlog, normalizeInventoryImageUrl } from "@/lib/inventoryApi";
import { localizePath, supportedLocales, defaultLocale } from "@/lib/i18nRoutes";
import React from "react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxartrade.me";
const HREFLANG = { en: "en", me: "sr-ME", ru: "ru" };

export async function generateMetadata({ params }) {
  const locale = getPreferredLocale();
  let title = "Services | LUXAR TRADE";
  let description = "";
  let ogImage = "/images/logo.png";
  let blog = null;

  try {
    blog = await fetchBlog(params?.id, locale);
    if (blog?.title) title = `${blog.title} | LUXAR TRADE`;
    if (blog?.description)
      description = String(blog.description)
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
    const rawImage = blog?.coverImagePath || blog?.generatedCoverImage;
    if (rawImage) ogImage = normalizeInventoryImageUrl(rawImage);
  } catch {
    // fallback to defaults
  }

  const basePath = `/services/${params.id}/${params.alias}`;
  const languages = Object.fromEntries([
    ...supportedLocales.map((l) => [
      HREFLANG[l] || l,
      `${SITE_URL}${localizePath(basePath, l)}`,
    ]),
    ["x-default", `${SITE_URL}${localizePath(basePath, defaultLocale)}`],
  ]);

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}${localizePath(basePath, locale)}`,
      languages,
    },
    openGraph: {
      type: "article",
      url: `${SITE_URL}${basePath}`,
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

export default function ServicesPage({ params }) {
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <BlogFromApi blogId={params?.id} origin="services" />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
