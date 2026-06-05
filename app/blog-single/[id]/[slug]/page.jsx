import BlogFromApi from "@/components/blogs/BlogFromApi";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import { getPreferredLocale } from "@/lib/metadataHelper";
import { fetchBlog } from "@/lib/inventoryApi";
import { localizePath, supportedLocales, defaultLocale } from "@/lib/i18nRoutes";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxartrade.me";
const HREFLANG = { en: "en", me: "sr-ME", ru: "ru" };
import React from "react";
import Blogs from "@/components/homes/home-1/Blogs";

export async function generateMetadata({ params }) {
  const locale = getPreferredLocale();
  let title = "Blog | LUXAR TRADE";
  let description = "";
  let blog = null;
  try {
    blog = await fetchBlog(params?.id, locale);
    if (blog?.title) title = `${blog.title} | LUXAR TRADE`;
    if (blog?.description) description = String(blog.description).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  } catch {
    // fallback to defaults
  }
  const blogBasePath = blog?.alias
    ? `/blog-single/${params.id}/${blog.alias}`
    : `/blog-single/${params.id}`;
  const languages = Object.fromEntries([
    ...supportedLocales.map((l) => [HREFLANG[l] || l, `${SITE_URL}${localizePath(blogBasePath, l)}`]),
    ["x-default", `${SITE_URL}${localizePath(blogBasePath, defaultLocale)}`],
  ]);
  return { title, description, alternates: { canonical: `${SITE_URL}${localizePath(blogBasePath, locale)}`, languages } };
}

export default function BlogSingleSlugPage({ params, searchParams }) {
  const origin = searchParams?.origin;
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <BlogFromApi blogId={params?.id} origin={origin} />
      {origin !== "services" && <Blogs />}
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
