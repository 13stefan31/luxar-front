"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Gallery, Item } from "react-photoswipe-gallery";
import Slider from "react-slick";
import Link from "@/components/common/LocalizedLink";
import { useLanguage } from "@/context/LanguageContext";
import { useFloatingAction } from "@/context/FloatingActionContext";
import { normalizeInventoryImageUrl } from "@/lib/inventoryApi";
import RelatedCars from "./RelatedCars";
import Overview from "./sections/Overview";
import Description from "./sections/Description";

const MONTENEGRO_CITIES = [
  "Podgorica",
  "Niksic",
  "Herceg Novi",
  "Pljevlja",
  "Bijelo Polje",
  "Bar",
  "Ulcinj",
  "Budva",
  "Kotor",
  "Tivat",
  "Cetinje",
  "Danilovgrad",
  "Mojkovac",
  "Kolasin",
  "Zabljak",
  "Pluzine",
  "Savnik",
  "Plav",
  "Rozaje",
  "Andrijevica",
  "Berane",
  "Petnjica",
  "Gusinje",
  "Tuzi",
  "Zeta",
];

const toInputDate = (date) => {
  if (!(date instanceof Date)) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateForMessage = (value) => {
  if (!value) {
    return "";
  }
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${day}.${month}.${year}`;
};

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "38267880066";

export default function Single1({ carItem }) {
  const { setReserveAction } = useFloatingAction() || {};
  const [selectedLocation, setSelectedLocation] = useState(
    MONTENEGRO_CITIES[0]
  );
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [dropoffTime, setDropoffTime] = useState("");
  const [message, setMessage] = useState("");
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();
  const today = toInputDate(new Date());
  const minDropoffDate = pickupDate || today;
  const detail = carItem?.raw || {};
  const galleryImages = Array.isArray(carItem?.images)
    ? carItem.images
        .map((image) => normalizeInventoryImageUrl(image, ""))
        .filter(Boolean)
    : [];
  const sliderImages = galleryImages.length
    ? galleryImages
    : ["/images/car.webp"];
  const showThumbs = sliderImages.length > 1;
  const showArrows = sliderImages.length > 1;
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

  const openReservationModal = useCallback(() => {
    setIsReservationModalOpen(true);
  }, []);

  const closeReservationModal = useCallback(() => {
    setIsReservationModalOpen(false);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 991px)");
    const handleChange = () => setIsMobile(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!setReserveAction) {
      return undefined;
    }
    const reserveLabel = carItem?.title
      ? `${t("Reserve a vehicle")} ${carItem.title}`
      : t("Reserve a vehicle");
    setReserveAction({
      label: reserveLabel,
      onClick: openReservationModal,
    });
    return () => setReserveAction(null);
  }, [carItem?.title, openReservationModal, setReserveAction, t]);

  useEffect(() => {
    if (!isReservationModalOpen) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeReservationModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.body.classList.add("reservation-modal-open");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
      document.body.classList.remove("reservation-modal-open");
    };
  }, [closeReservationModal, isReservationModalOpen]);

  const handleReservationSubmit = (event) => {
    event.preventDefault();
    const reservationLines = [
      `${t("Vehicle")}: ${carItem?.title || t("Vehicle")}`,
      `${t("Location")}: ${selectedLocation || "-"}`,
      `${t("Pick-up location")}: ${pickupLocation || "-"}`,
      `${t("Pickup date")}: ${formatDateForMessage(pickupDate) || "-"}`,
      `${t("Pickup time")}: ${pickupTime || "-"}`,
      `${t("Drop-off location")}: ${dropoffLocation || "-"}`,
      `${t("Drop-off date")}: ${formatDateForMessage(dropoffDate) || "-"}`,
      `${t("Drop-off time")}: ${dropoffTime || "-"}`,
      message ? `${t("Message")}: ${message}` : null,
      typeof window !== "undefined" ? `URL: ${window.location.href}` : null,
    ].filter(Boolean);

    const text = reservationLines.join("\n");
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setIsReservationModalOpen(false);
  };

  const reservationForm = (
    <div className="content-box">
      <h6 className="title">{t("Reserve a vehicle")}</h6>
      <p className="text">
        {t(
          "Choose a date, pickup location, and send a message so we can confirm the reservation."
        )}
      </p>
      <form className="reservation-form" onSubmit={handleReservationSubmit}>
        <div className="reservation-field">
          <label htmlFor="locationSelect">{t("Location")}</label>
          <input
            id="locationSelect"
            type="text"
            list="montenegroCities"
            placeholder={t("Select city")}
            required
            value={selectedLocation}
            onChange={(event) => setSelectedLocation(event.target.value)}
          />
        </div>
        <datalist id="montenegroCities">
          {MONTENEGRO_CITIES.map((place) => (
            <option key={place} value={place} />
          ))}
        </datalist>
        <fieldset className="reservation-fieldset">
          <legend>{t("Pick-up")}</legend>
          <div className="reservation-field">
            <label htmlFor="pickupLocation">{t("Pick-up location")}</label>
            <input
              id="pickupLocation"
              type="text"
              list="montenegroCities"
              placeholder={t("Airport, hotel, address")}
              autoComplete="street-address"
              required
              value={pickupLocation}
              onChange={(event) => setPickupLocation(event.target.value)}
            />
          </div>
          <div className="reservation-row">
            <div className="reservation-field">
              <label htmlFor="pickupDate">{t("Pickup date")}</label>
              <input
                id="pickupDate"
                type="date"
                min={today}
                required
                value={pickupDate}
                onChange={(event) => setPickupDate(event.target.value)}
              />
            </div>
            <div className="reservation-field">
              <label htmlFor="pickupTime">{t("Pickup time")}</label>
              <input
                id="pickupTime"
                type="time"
                required
                value={pickupTime}
                onChange={(event) => setPickupTime(event.target.value)}
              />
            </div>
          </div>
        </fieldset>
        <fieldset className="reservation-fieldset">
          <legend>{t("Drop-off")}</legend>
          <div className="reservation-field">
            <label htmlFor="dropoffLocation">{t("Drop-off location")}</label>
            <input
              id="dropoffLocation"
              type="text"
              list="montenegroCities"
              placeholder={t("Airport, hotel, address")}
              autoComplete="street-address"
              required
              value={dropoffLocation}
              onChange={(event) => setDropoffLocation(event.target.value)}
            />
          </div>
          <div className="reservation-row">
            <div className="reservation-field">
              <label htmlFor="dropoffDate">{t("Drop-off date")}</label>
              <input
                id="dropoffDate"
                type="date"
                min={minDropoffDate}
                required
                value={dropoffDate}
                onChange={(event) => setDropoffDate(event.target.value)}
              />
            </div>
            <div className="reservation-field">
              <label htmlFor="dropoffTime">{t("Drop-off time")}</label>
              <input
                id="dropoffTime"
                type="time"
                required
                value={dropoffTime}
                onChange={(event) => setDropoffTime(event.target.value)}
              />
            </div>
          </div>
        </fieldset>
        <div className="reservation-field">
          <label htmlFor="message">{t("Message")}</label>
          <textarea
            id="message"
            rows={3}
            placeholder={t("Tell us what you need")}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
        <button type="submit" className="side-btn reservation-submit">
          {t("Send reservation")}
        </button>
      </form>
    </div>
  );

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
                            arrows={showArrows}
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
                    <Overview
                      detail={detail}
                      t={t}
                      title={carItem?.title || t("Vehicle")}
                    />
                  </div>
                  <div className="description-sec">
                    <Description detail={detail} />
                  </div>
                </div>
              </div>
              <div className="side-bar-column style-1 col-lg-4 col-md-12 col-sm-12">
                <div className="inner-column">
                  {!isMobile && (
                    <div className="reservation-box sticky-reservation">
                      {reservationForm}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Gallery>
        </div>
        <RelatedCars />
      </section>
      {isReservationModalOpen && (
        <div
          className="reservation-modal"
          role="dialog"
          aria-modal="true"
          aria-label={t("Reserve a vehicle")}
        >
          <div
            className="reservation-modal__overlay"
            onClick={closeReservationModal}
          />
          <div className="reservation-modal__content">
            <button
              type="button"
              className="reservation-modal__close"
              onClick={closeReservationModal}
              aria-label={t("Close")}
            >
              <span aria-hidden="true">&times;</span>
            </button>
            <div className="reservation-box reservation-box--modal">
              {reservationForm}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
