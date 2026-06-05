import React from "react";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { getPreferredLocale } from "@/lib/metadataHelper";
import { fetchBlogs, normalizeInventoryImageUrl } from "@/lib/inventoryApi";
import BlogsSliderClient from "./BlogsSliderClient";
import translations from "@/locales";

function t(key, locale) {
  return translations[locale]?.[key] ?? translations.en?.[key] ?? key;
}

const mapApiBlog = (blog) => ({
  id: blog.id,
  title: blog.title,
  description: blog.description,
  author: blog.author || "Admin",
  date: blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("sr-Latn-ME", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "",
  slug: blog.alias,
  imageSrc: blog.coverImagePath
    ? normalizeInventoryImageUrl(blog.coverImagePath)
    : blog.generatedCoverImage
    ? normalizeInventoryImageUrl(blog.generatedCoverImage)
    : "/images/placeholder.svg",
});

export default async function Blogs({ showBreadcrumb = false }) {
  const locale = getPreferredLocale();
  let posts = [];
  try {
    const data = await fetchBlogs(locale);
    posts = data.map(mapApiBlog);
  } catch {}

  if (posts.length === 0) return null;

  if (!showBreadcrumb) {
    return (
      <section className="blog-section">
        <div className="boxcar-container">
          <div className="boxcar-title wow fadeInUp">
            <h2>{t("Latest from our blog", locale)}</h2>
          </div>
          <BlogsSliderClient posts={posts} />
        </div>
      </section>
    );
  }

  return (
    <section className="blog-section">
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp">
          <ul className="breadcrumb">
            <li>
              <Link href="/">{t("Home", locale)}</Link>
            </li>
            <li>
              <span>{t("Blog", locale)}</span>
            </li>
          </ul>
          <h2>{t("Blog", locale)}</h2>
        </div>
        <div className="row">
          {posts.map((post, index) => {
            const postHref = post.slug
              ? `/blog-single/${post.id}/${post.slug}`
              : `/blog-single/${post.id}`;
            return (
              <div className="blog-block col-lg-4 col-md-6 col-sm-12" key={index}>
                <div className="inner-box wow fadeInUp">
                  <div className="image-box">
                    <figure className="image">
                      <Link href={postHref}>
                        <Image
                          alt={post.title}
                          src={post.imageSrc}
                          width={448}
                          height={300}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Link>
                    </figure>
                    <span className="date">{post.date}</span>
                  </div>
                  <div className="content-box">
                    <h6 className="title">
                      <Link href={postHref} title="">{post.title}</Link>
                    </h6>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
