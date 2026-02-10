"use client";
import React from "react";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { blogPosts } from "@/data/blogs";
import { useLanguage } from "@/context/LanguageContext";
import Slider from "react-slick";
export default function Blogs({ showBreadcrumb = false }) {
  const { t } = useLanguage();
  const baseSlidesToShow = 3;
  const totalSlides = blogPosts.length;
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
    return (
      <div className={wrapperClassName} key={index}>
        <div className="inner-box wow fadeInUp" data-wow-delay={wowDelay}>
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
  };
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
            {blogPosts.map((post, index) =>
              renderCard(
                post,
                index,
                "blog-block col-lg-4 col-md-6 col-sm-12"
              )
            )}
          </div>
        ) : (
          <Slider {...slickOptions} className="blog-slider">
            {blogPosts.map((post, index) =>
              renderCard(post, index, "blog-block")
            )}
          </Slider>
        )}
      </div>
    </section>
  );
}
