"use client";
import React, { useEffect, useState } from "react";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { fetchBlog, normalizeInventoryImageUrl } from "@/lib/inventoryApi";

export default function BlogFromApi({ blogId }) {
  const { t, locale } = useLanguage();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchBlog(blogId, locale)
      .then((data) => {
        setBlog(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Blog nije pronađen.");
        setLoading(false);
      });
  }, [blogId, locale]);

  if (loading) {
    return (
      <section className="blog-section-single">
        <div className="boxcar-container">
          <p className="text">{t("Loading...")}</p>
        </div>
      </section>
    );
  }

  if (error || !blog) {
    return (
      <section className="blog-section-single">
        <div className="boxcar-container">
          <p className="text">{error || t("Blog not found.")}</p>
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
            <li>
              <Link href="/">{t("Home")}</Link>
            </li>
            <li>
              <Link href="/blog-list-01">{t("Blog")}</Link>
            </li>
            <li>
              <span>{blog.title}</span>
            </li>
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
                      <Image
                        alt={blog.title}
                        width={924}
                        height={450}
                        src={coverImage}
                        priority
                      />
                    </figure>
                  )}
                </div>
                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
