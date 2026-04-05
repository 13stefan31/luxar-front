"use client";
import React, { useEffect, useState } from "react";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { fetchBlogs, normalizeInventoryImageUrl } from "@/lib/inventoryApi";
import Slider from "react-slick";

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
  src: blog.coverImagePath
    ? normalizeInventoryImageUrl(blog.coverImagePath)
    : blog.generatedCoverImage
    ? normalizeInventoryImageUrl(blog.generatedCoverImage)
    : "/images/placeholder.svg",
  imageSrc: blog.coverImagePath
    ? normalizeInventoryImageUrl(blog.coverImagePath)
    : blog.generatedCoverImage
    ? normalizeInventoryImageUrl(blog.generatedCoverImage)
    : "/images/placeholder.svg",
});

export default function Blogs({ showBreadcrumb = false }) {
  const { t, locale } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchBlogs(locale)
      .then((data) => {
        setPosts(data.map(mapApiBlog));
        setLoading(false);
      })
      .catch(() => {
        setPosts([]);
        setLoading(false);
      });
  }, [locale]);

  const baseSlidesToShow = 3;
  const totalSlides = posts.length;
  const slidesToShow = Math.max(1, Math.min(baseSlidesToShow, totalSlides));
  const slickOptions = {
    infinite: totalSlides > slidesToShow,
    slidesToShow,
    slidesToScroll: 1,
    dots: false,
    arrows: true,
    speed: 400,
    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: Math.min(2, totalSlides),
          slidesToScroll: 1,
          infinite: totalSlides > 2,
          arrows: true,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: Math.min(1, totalSlides),
          slidesToScroll: 1,
          infinite: totalSlides > 1,
          arrows: true,
        },
      },
    ],
  };

  const renderCard = (post, index, wrapperClassName) => {
    const imageSrc = post.src || post.imageSrc;
    const wowDelay = post.wowDelay || post.delay || "0ms";
    const postHref = post.slug
      ? `/blog-single/${post.id}/${post.slug}`
      : `/blog-single/${post.id}`;
    return (
      <div className={wrapperClassName} key={index}>
        <div className="inner-box wow fadeInUp" data-wow-delay={wowDelay}>
          <div className="image-box">
            <figure className="image">
              <Link href={postHref}>
                <Image
                  alt={post.title}
                  src={imageSrc}
                  width={448}
                  height={300}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Link>
            </figure>
            <span className="date">{t(post.date)}</span>
          </div>
          <div className="content-box">
            <h6 className="title">
              <Link href={postHref} title="">
                {t(post.title)}
              </Link>
            </h6>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return null;
  if (posts.length === 0) return null;

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
        {showBreadcrumb ? (
          <div className="row">
            {posts.map((post, index) =>
              renderCard(
                post,
                index,
                "blog-block col-lg-4 col-md-6 col-sm-12"
              )
            )}
          </div>
        ) : (
          <Slider {...slickOptions} className="blog-slider">
            {posts.map((post, index) =>
              renderCard(post, index, "blog-block")
            )}
          </Slider>
        )}
      </div>
    </section>
  );
}
