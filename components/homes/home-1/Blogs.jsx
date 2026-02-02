"use client";
import React from "react";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { blogPosts } from "@/data/blogs";
import { useLanguage } from "@/context/LanguageContext";
export default function Blogs({ showBreadcrumb = false }) {
  const { t } = useLanguage();
  return (
    <section className="blog-section">
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp">
          {showBreadcrumb ? (
            <>
              <ul className="breadcrumb">
                <li>
                  <Link href={`/`}>{t("Home")}</Link>
                </li>
                <li>
                  <span>{t("Blog")}</span>
                </li>
              </ul>
              <h2>{t("Blog")}</h2>
            </>
          ) : (
            <h2>{t("Latest from our blog")}</h2>
          )}
        </div>
        <div className="row">
          {blogPosts.map((post, index) => {
            const imageSrc = post.src || post.imageSrc;
            const wowDelay = post.wowDelay || post.delay || "0ms";
            return (
            <div className="blog-block col-lg-4 col-md-6 col-sm-12" key={index}>
              <div
                className={`inner-box wow fadeInUp`}
                data-wow-delay={wowDelay}
              >
                <div className="image-box">
                  <figure className="image">
                    <Link href={`/blog-single/${post.id}`}>
                      <Image
                        alt={post.title}
                        src={imageSrc}
                        width={448}
                        height={300}
                      />
                    </Link>
                  </figure>
                  <span className="date">{t(post.date)}</span>
                </div>
                <div className="content-box"> 
                  <h6 className="title">
                    <Link href={`/blog-single/${post.id}`} title="">
                      {t(post.title)}
                    </Link>
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
