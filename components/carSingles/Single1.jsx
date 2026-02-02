"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Gallery, Item } from "react-photoswipe-gallery";
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
  const mainImage = galleryImages[0] || "/images/car.webp";
  const sideImages = galleryImages.slice(1, 5);
  while (sideImages.length < 4) {
    sideImages.push(mainImage);
  }
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
            <div className="gallery-sec">
              <div className="row">
                <div className="image-column item1 col-lg-7 col-md-12 col-sm-12">
                  <div className="inner-column">
                    <div className="image-box">
                      <figure className="image">
                        <Item
                          original={mainImage}
                          thumbnail={mainImage}
                          width={805}
                          height={550}
                        >
                          {({ ref, open }) => (
                            <a onClick={open}>
                              <Image
                                alt={carItem?.title || ""}
                                src={mainImage}
                                width={805}
                                height={550}
                                ref={ref}
                              />
                            </a>
                          )}
                        </Item>
                      </figure>
                    </div>
                  </div>
                </div>
                <div className="col-lg-5 col-md-12 col-sm-12 d-flex">
                  <div className="side-gallery-grid flex-fill">
                    {sideImages.slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className={`thumb-cell image-column-two item${index + 2}`}
                      >
                        <div className="inner-column">
                          <div className="image-box">
                            <figure className="image">
                              <Item
                                original={image}
                                thumbnail={image}
                                width={285}
                                height={269}
                              >
                                {({ ref, open }) => (
                                  <a onClick={open} className="fancybox">
                                    <Image
                                      ref={ref}
                                      alt={carItem?.title || ""}
                                      src={image}
                                      width={285}
                                      height={269}
                                    />
                                  </a>
                                )}
                              </Item>
                            </figure>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Gallery>
          <div className="row">
            <div className="inspection-column col-lg-8 col-md-12 col-sm-12">
              <div className="inner-column">
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
                        onChange={(event) => setSelectedLocation(event.target.value)}
                      >
                        {LOCATION_OPTIONS.map((place) => (
                          <option key={place} value={place}>
                            {place}
                          </option>
                        ))}
                      </select>
                      <label htmlFor="pickupLocation">{t("Pick-up location")}</label>
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
                      <button type="submit" className="side-btn reservation-submit">
                        {t("Send reservation")}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <RelatedCars />
      </section>
    </>
  );
}
