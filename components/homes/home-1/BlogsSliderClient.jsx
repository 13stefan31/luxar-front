"use client";
import React from "react";
import Slider from "react-slick";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";

export default function BlogsSliderClient({ posts }) {
  const totalSlides = posts.length;
  const baseSlidesToShow = 3;
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

  return (
    <Slider {...slickOptions} className="blog-slider">
      {posts.map((post, index) => {
        const postHref = post.slug
          ? `/blog-single/${post.id}/${post.slug}`
          : `/blog-single/${post.id}`;
        return (
          <div className="blog-block" key={index}>
            <div className="inner-box wow fadeInUp" data-wow-delay={post.wowDelay || "0ms"}>
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
    </Slider>
  );
}
