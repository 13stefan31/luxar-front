"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Gallery, Item } from "react-photoswipe-gallery";
import Slider from "react-slick";
import Link from "@/components/common/LocalizedLink";
import { useLanguage } from "@/context/LanguageContext";
import RelatedCars from "./RelatedCars";
import Overview from "./sections/Overview";
import Description from "./sections/Description";

const LOCATION_OPTIONS = ["Podgorica", "Budva", "Bar", "Tivat", "Niksic"];

export default function Single1({ carItem }) {
  const [selectedLocation, setSelectedLocation] = useState(LOCATION_OPTIONS[0]);
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [dropoffDateTime, setDropoffDateTime] = useState("");
  const [message, setMessage] = useState("");
  const { t } = useLanguage();
  const detail = carItem?.raw || {};
  const galleryImages = Array.isArray(carItem?.images)
    ? carItem.images.filter(Boolean)
    : [];
  const sliderImages = galleryImages.length
    ? galleryImages
    : ["/images/car.webp"];
  const showThumbs = sliderImages.length > 1;
  const thumbSlidesToShow = Math.min(6, sliderImages.length);
  const thumbSlidesMd = Math.min(5, sliderImages.length);
  const thumbSlidesSm = Math.min(4, sliderImages.length);
  const thumbSlidesXs = Math.min(3, sliderImages.length);
  const mainSliderRef = useRef(null);
  const thumbSliderRef = useRef(null);
  const [navMain, setNavMain] = useState(null);
  const [navThumbs, setNavThumbs] = useState(null);
  useEffect(() => {
    setNavMain(mainSliderRef.current);
    setNavThumbs(thumbSliderRef.current);
  }, []);
  const specs = Array.isArray(carItem?.specs) ? carItem.specs : [];

  const handleReservationSubmit = (event) => {
    event.preventDefault();
    console.log({
      selectedLocation,
      pickupLocation,
      pickupDateTime,
      dropoffLocation,
      dropoffDateTime,
      message,
    });
  };

  return (
    <>
      <section className="inventory-section pb-0 layout-radius">
        <div className="boxcar-container">
          <div className="boxcar-title-three">
            <ul className="breadcrumb">
              <li>
                <Link href={`/`}>{t("Home")}</Link>
              </li>
              <li>
                <Link href={`/cars`}>{t("Our vehicles")}</Link>
              </li>
              <li>
                <span>{carItem?.title || t("Vehicle")}</span>
              </li>
            </ul>
            <h2>{carItem?.title || t("Vehicle")}</h2>
          </div>
          <Gallery>
            <div className="row">
              <div className="inspection-column col-lg-8 col-md-12 col-sm-12">
                <div className="inner-column">
                  <div className="gallery-sec gallery-slider">
                    <div className="row">
                      <div className="col-12">
                        <div className="wrap-slider-gallery">
                          <Slider
                            className="gallery-main-slider"
                            asNavFor={navThumbs}
                            ref={mainSliderRef}
                            arrows
                            dots={false}
                            infinite={false}
                            slidesToShow={1}
                            slidesToScroll={1}
                            adaptiveHeight
                          >
                            {sliderImages.map((image, index) => (
                              <div
                                className="gallery-main-slide"
                                key={`${image}-${index}`}
                              >
                                <div className="image-box">
                                  <figure className="image">
                                    <Item
                                      original={image}
                                      thumbnail={image}
                                      width={1200}
                                      height={800}
                                    >
                                      {({ ref, open }) => (
                                        <button
                                          type="button"
                                          className="gallery-main-trigger"
                                          ref={ref}
                                          onClick={open}
                                          aria-label={`${carItem?.title || ""} ${index + 1}`}
                                        >
                                          <Image
                                            alt={carItem?.title || ""}
                                            src={image}
                                            width={1200}
                                            height={800}
                                            className="gallery-main-image"
                                          />
                                        </button>
                                      )}
                                    </Item>
                                  </figure>
                                </div>
                              </div>
                            ))}
                          </Slider>
                        </div>
                        {showThumbs && (
                          <div className="gallery-thumbs">
                            <Slider
                              className="gallery-thumbs-slider"
                              asNavFor={navMain}
                              ref={thumbSliderRef}
                              arrows={false}
                              dots={false}
                              infinite={false}
                              slidesToShow={thumbSlidesToShow}
                              slidesToScroll={1}
                              swipeToSlide
                              focusOnSelect
                              responsive={[
                                {
                                  breakpoint: 992,
                                  settings: { slidesToShow: thumbSlidesMd },
                                },
                                {
                                  breakpoint: 768,
                                  settings: { slidesToShow: thumbSlidesSm },
                                },
                                {
                                  breakpoint: 576,
                                  settings: { slidesToShow: thumbSlidesXs },
                                },
                              ]}
                            >
                              {sliderImages.map((image, index) => (
                                <div
                                  className="gallery-thumb"
                                  key={`${image}-thumb-${index}`}
                                >
                                  <Image
                                    alt={carItem?.title || ""}
                                    src={image}
                                    width={200}
                                    height={140}
                                    className="gallery-thumb-image"
                                  />
                                </div>
                              ))}
                            </Slider>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="overview-sec">
                    <Overview detail={detail} t={t} />
                  </div>
                  <div className="description-sec">
                    <Description />
                  </div>
                </div>
              </div>
              <div className="side-bar-column style-1 col-lg-4 col-md-12 col-sm-12">
                <div className="inner-column">
                  <div className="reservation-box sticky-reservation">
                    <div className="content-box">
                      <h6 className="title">{t("Reserve a vehicle")}</h6>
                      <p className="text">
                        {t(
                          "Choose a date, pickup location, and send a message so we can confirm the reservation."
                        )}
                      </p>
                      <form
                        className="reservation-form"
                        onSubmit={handleReservationSubmit}
                      >
                        <label htmlFor="locationSelect">{t("Location")}</label>
                        <select
                          id="locationSelect"
                          value={selectedLocation}
                          onChange={(event) =>
                            setSelectedLocation(event.target.value)
                          }
                        >
                          {LOCATION_OPTIONS.map((place) => (
                            <option key={place} value={place}>
                              {place}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="pickupLocation">
                          {t("Pick-up location")}
                        </label>
                        <input
                          id="pickupLocation"
                          type="text"
                          placeholder={t("Enter location")}
                          value={pickupLocation}
                          onChange={(event) => setPickupLocation(event.target.value)}
                        />
                        <label htmlFor="pickupDateTime">
                          {t("Pick-up date and time")}
                        </label>
                        <input
                          id="pickupDateTime"
                          type="datetime-local"
                          value={pickupDateTime}
                          onChange={(event) =>
                            setPickupDateTime(event.target.value)
                          }
                        />
                        <label htmlFor="dropoffLocation">
                          {t("Drop-off location")}
                        </label>
                        <input
                          id="dropoffLocation"
                          type="text"
                          placeholder={t("Enter location")}
                          value={dropoffLocation}
                          onChange={(event) =>
                            setDropoffLocation(event.target.value)
                          }
                        />
                        <label htmlFor="dropoffDateTime">
                          {t("Drop-off date and time")}
                        </label>
                        <input
                          id="dropoffDateTime"
                          type="datetime-local"
                          value={dropoffDateTime}
                          onChange={(event) =>
                            setDropoffDateTime(event.target.value)
                          }
                        />
                        <label htmlFor="message">{t("Message")}</label>
                        <textarea
                          id="message"
                          rows={4}
                          placeholder={t("Tell us what you need")}
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                        />
                        <button
                          type="submit"
                          className="side-btn reservation-submit"
                        >
                          {t("Send reservation")}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Gallery>
        </div>
        <RelatedCars />
      </section>
    </>
  );
}
