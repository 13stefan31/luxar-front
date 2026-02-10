"use client";
import Link from "@/components/common/LocalizedLink";
import { useState } from "react";
import ModalVideo from "react-modal-video";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
export default function Features() {
  const [isOpen, setOpen] = useState(false);
  const { t } = useLanguage();
  return (
    <>
      <section className="boxcar-pricing-section pb-0 pt-0">
        <div className="large-container">
          <div className="row g-0">
            {/* image-column */}
            <div className="image-column col-lg-6 col-md-12 col-sm-12">
              <div className="inner-column">
                <div className="image-box">
                  <figure className="image">
                    <a href="#">
                      <Image
                        alt=""
                        src="https://images.pexels.com/photos/30362307/pexels-photo-30362307.jpeg?cs=srgb&dl=pexels-murdashots-611021625-30362307.jpg&fm=jpg"
                        width={1920}
                        height={1280}
                      />
                    </a>
                  </figure> 
                </div>
              </div>
            </div>
            <div className="content-column col-lg-6 col-md-12 col-sm-12">
              <div className="inner-column">
                <div className="boxcar-title wow fadeInUp">
                  <h2>
                    {t(
                      "Get the best car rental offer today"
                    )}
                  </h2>
                  <div className="text">
                    {t(
                      "Our mission is to provide a simple, safe, and affordable car rental experience, with maximum flexibility and comfort."
                    )}
                  </div>
                </div>
                <ul
                  className="list-style-one wow fadeInUp"
                  data-wow-delay="100ms"
                >
                  <li>
                    <i className="fa-solid fa-check" />
                    {t("The largest selection of cars of different classes and sizes")}
                  </li>
                  <li>
                    <i className="fa-solid fa-check" />
                    {t("24/7 support and roadside assistance")}
                  </li>
                  <li>
                    <i className="fa-solid fa-check" />
                    {t("Pickup and return at multiple locations")}
                  </li>
                </ul>
                <Link
                  href={`/about`}
                  className="read-more wow fadeInUp"
                  data-wow-delay="200ms"
                >
                  {t("See our offer")}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={14}
                    height={14}
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_634_2156)">
                      <path
                        d="M13.6106 0H5.05509C4.84013 0 4.66619 0.173943 4.66619 0.388901C4.66619 0.603859 4.84013 0.777802 5.05509 0.777802H12.6719L0.113453 13.3362C-0.0384687 13.4881 -0.0384687 13.7342 0.113453 13.8861C0.189396 13.962 0.288927 14 0.388422 14C0.487917 14 0.587411 13.962 0.663391 13.8861L13.2218 1.3277V8.94447C13.2218 9.15943 13.3957 9.33337 13.6107 9.33337C13.8256 9.33337 13.9996 9.15943 13.9996 8.94447V0.388901C13.9995 0.173943 13.8256 0 13.6106 0Z"
                        fill="white"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_634_2156">
                        <rect width={14} height={14} fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ModalVideo
        channel="youtube"
        youtube={{ mute: 0, autoplay: 0 }}
        isOpen={isOpen}
        videoId="AC1cREPIw_o"
        onClose={() => setOpen(false)}
      />{" "}
    </>
  );
}
