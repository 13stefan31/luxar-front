import React from "react";
import Image from "next/image";
import Link from "@/components/common/LocalizedLink";
import { getPreferredLocale } from "@/lib/metadataHelper";
import { fetchBlog, normalizeInventoryImageUrl } from "@/lib/inventoryApi";
import BlogShareButtons from "./BlogShareButtons";
import translations from "@/locales";

function t(key, locale) {
  return translations[locale]?.[key] ?? translations.en?.[key] ?? key;
}

export default async function BlogFromApi({ blogId, origin }) {
  const locale = getPreferredLocale();

  let blog = null;
  let error = "";

  try {
    blog = await fetchBlog(blogId, locale);
  } catch (err) {
    error = err?.message || "Blog nije pronađen.";
  }

  if (error || !blog) {
    return (
      <section className="blog-section-single">
        <div className="boxcar-container">
          <p className="text">{error || t("Blog not found.", locale)}</p>
        </div>
      </section>
    );
  }

  const coverImage = blog.coverImagePath
    ? normalizeInventoryImageUrl(blog.coverImagePath)
    : blog.generatedCoverImage
    ? normalizeInventoryImageUrl(blog.generatedCoverImage)
    : null;

  const publishedDate = blog.publishedAt
    ? new Date(
        typeof blog.publishedAt === "string"
          ? blog.publishedAt
          : blog.publishedAt.date
      ).toLocaleDateString("sr-Latn-ME", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <section className="blog-section-five layout-radius">
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp">
          <ul className="breadcrumb">
            <li><Link href="/">{t("Home", locale)}</Link></li>
            {origin === "services" ? (
              <li><span>{t("Locations", locale)}</span></li>
            ) : (
              <li><Link href="/blog-list-01">{t("Blog", locale)}</Link></li>
            )}
            <li><span>{blog.title}</span></li>
          </ul>
          {publishedDate && (
            <ul className="post-info">
              <li>{publishedDate}</li>
            </ul>
          )}
          <h2>{blog.title}</h2>
          {blog.description && (
            <div className="blog-subtitle">{blog.description}</div>
          )}
        </div>
      </div>
      <div className="right-box">
        <div className="large-container">
          <div className="content-box">
            <div className="right-box-two">
              <div className="image-sec">
                <div className="image-box">
                  {coverImage && (
                    <figure className="inner-image">
                      <Image alt={blog.title} width={924} height={450} src={coverImage} priority />
                    </figure>
                  )}
                </div>
                <div className="blog-content">
                  <BlogShareButtons blogTitle={blog.title} />
                  {blog.content && (
                    <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                  )}
                  <BlogShareButtons blogTitle={blog.title} extraClass="blog-share--bottom" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
