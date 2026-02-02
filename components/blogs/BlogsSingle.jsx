"use client";
import React from "react";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
export default function BlogsSingle({ blogItem }) {
  const { t } = useLanguage();
  const title = blogItem?.title ? t(blogItem.title) : "";
  const date =
    blogItem?.date || blogItem?.datePublished
      ? t(blogItem?.date || blogItem?.datePublished)
      : null;
  const imageSrc =
    blogItem?.imageSrc ||
    blogItem?.src ||
    blogItem?.imgSrc ||
    "/images/placeholder.svg";
  return (
    <section className="blog-section-five layout-radius">
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp">
          <ul className="breadcrumb">
            <li>
              <Link href={`/`}>{t("Home")}</Link>
            </li>
            <li>
              <Link href={`/blog-list-01`}>{t("Blog")}</Link>
            </li>
            <li>
              <span>{title || t("Blog")}</span>
            </li>
          </ul>
          <h2>{title}</h2>
          {date ? (
            <ul className="post-info">
              <li>{date}</li>
            </ul>
          ) : null}
        </div>
      </div>
      <div className="right-box">
        <div className="large-container">
          <div className="content-box"> 
            <div className="right-box-two">  
              <div className="image-sec">
                <div className="image-box">
                  <figure className="inner-image">
                    <Image
                      alt={title}
                      width={924}
                      height={450}
                      src={imageSrc}
                    />
                  </figure>
                </div>

                <div className="text">
                  Aliquam hendrerit sollicitudin purus, quis rutrum mi accumsan
                  nec. Quisque bibendum orci ac nibh facilisis, at malesuada orci
                  congue. Nullam tempus sollicitudin cursus. Ut et adipiscing
                  erat. Curabitur this is a text link libero tempus congue.Aliquam hendrerit sollicitudin purus, quis rutrum mi accumsan
                  nec. Quisque bibendum orci ac nibh facilisis, at malesuada orci
                  congue. Nullam tempus sollicitudin cursus. Ut et adipiscing
                  erat. Curabitur this is a text link libero tempus congue.Aliquam hendrerit sollicitudin purus, quis rutrum mi accumsan
                  nec. Quisque bibendum orci ac nibh facilisis, at malesuada orci
                  congue. Nullam tempus sollicitudin cursus. Ut et adipiscing
                  erat. Curabitur this is a text link libero tempus congue.
                </div>  
              </div> 
              <div className="social-section">
                <div className="inner-column">
                  <ul className="social-icons">
                    <li>Podijeli</li>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-facebook-f" />
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-twitter" />
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="fa-brands fa-instagram" />
                      </a>
                    </li> 
                  </ul>
                   
                </div>
              </div>    
            </div>
          </div>
        </div>
      </div> 
    </section>
  );
}
