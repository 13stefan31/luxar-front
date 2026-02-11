"use client";
import React from "react";
import Image from "next/image";
import Link from "@/components/common/LocalizedLink";
import { useLanguage } from "@/context/LanguageContext";
export default function Contact() {
  const { t, locale } = useLanguage();
  const WHATSAPP_NUMBER = "38267880066";
  const PHONE_TEL = "+38267880066";
  const PHONE_DISPLAY = "+382 67 88 00 66";
  const EMAIL_ADDRESS = "luxartrade@gmail.com";
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}`;
  const brandByLocale = {
    en: "Luxar",
    me: "Luxar",
    ru: "Luxar",
  };
  const brand = brandByLocale[locale] || "Luxar";
  const headingTemplate = t("Get in Touch With {brand} - Car Rental Montenegro");
  const headingParts = headingTemplate.split("{brand}");
  return (
    <section className="contact-us-section layout-radius">
      <div className="boxcar-container">
        {/* boxcar-title */}
        <div className="boxcar-title-three wow fadeInUp">
          <ul className="breadcrumb">
            <li>
              <Link href={`/`}>{t("Home")}</Link>
            </li>
            <li>
              <span>{t("Contact us")}</span>
            </li>
          </ul> 
        </div>
        {/* End section title */}
        {/* calculater-section */}
        <div className="calculater-sec">
          <div className="right-box">
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12">
                <div className="boxcar-title contact-hero">
                  <h1>
                    {headingParts.length === 2 ? (
                      <>
                        {headingParts[0]}
                        <span className="brand-gold-text">{brand}</span>
                        {headingParts[1]}
                      </>
                    ) : (
                      headingTemplate
                    )}
                  </h1>
                  <p>
                    {t(
                      "Contact us directly, on WhatsApp, and let’s turn the key!"
                    )}
                  </p>
                </div>
              </div>
              <div className="contact-column col-lg-12 col-md-12 col-sm-12">
                <div className="inner-column contact-card">
                  <div className="contact-callout">
                    <span className="callout-icon" aria-hidden="true">
                      <i className="fa-brands fa-whatsapp" />
                    </span>
                    <div className="callout-copy">
                      <h6 className="title">{t("WhatsApp")}</h6>
                      <div className="text">
                        {t("Fastest way to reach us is WhatsApp.")}
                      </div>
                    </div>
                    <a
                      className="theme-btn contact-whatsapp-btn"
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("Open WhatsApp")}
                      <Image
                        alt=""
                        width={14}
                        height={14}
                        src="/images/arrow.svg"
                      />
                    </a>
                  </div>
                  <div className="contact-info-grid">
                    <div className="content-box">
                      <h6 className="title">
                        <span className="icon">
                          <svg
                            width={26}
                            height={26}
                            viewBox="0 0 26 26"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M23.5126 10.9886C23.1042 10.9886 22.7532 10.682 22.7066 10.2671C22.2949 6.60979 19.4533 3.77145 15.796 3.3652C15.3507 3.31537 15.029 2.91454 15.0788 2.4682C15.1276 2.02295 15.5273 1.69037 15.9758 1.75103C20.3926 2.2407 23.8246 5.66837 24.3207 10.0851C24.3717 10.5315 24.0499 10.9333 23.6047 10.9832C23.5743 10.9864 23.5429 10.9886 23.5126 10.9886Z"
                              fill="#E1E1E1"
                            />
                            <path
                              d="M19.676 11.0003C19.2947 11.0003 18.9556 10.7316 18.8798 10.3438C18.5678 8.74044 17.3317 7.50436 15.7305 7.19344C15.2896 7.10786 15.0025 6.68211 15.0881 6.24119C15.1737 5.80027 15.6103 5.51319 16.0403 5.59877C18.2948 6.03644 20.0357 7.77628 20.4744 10.0318C20.56 10.4738 20.2729 10.8995 19.8331 10.9851C19.78 10.9949 19.728 11.0003 19.676 11.0003Z"
                              fill="#E1E1E1"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.10554 17.8102C13.2113 22.9171 16.6108 24.2561 18.758 24.2561C19.8175 24.2561 20.5737 23.93 21.0774 23.5681C21.1002 23.5551 23.4315 22.1295 23.8399 19.9715C24.0328 18.9586 23.7511 17.9565 23.0274 17.0725C20.0461 13.4531 18.5273 13.7911 16.8503 14.6068C15.82 15.1116 15.0064 15.5038 12.7087 13.2082C10.4122 10.9108 10.8084 10.0971 11.3099 9.06703C12.1267 7.39003 12.4628 5.87083 8.84221 2.88733C7.96038 2.16692 6.96479 1.88525 5.95296 2.07483C3.82638 2.47242 2.39421 4.76583 2.39421 4.76583C1.25454 6.36592 0.481047 10.1868 8.10554 17.8102ZM6.28446 3.66517C6.37979 3.65 6.47404 3.64133 6.56721 3.64133C6.99188 3.64133 7.40138 3.80708 7.80979 4.14292C10.7294 6.54789 10.36 7.30624 9.84864 8.35598C9.08055 9.93439 8.67863 11.4749 11.5593 14.3576C14.4431 17.2404 15.9847 16.8385 17.5609 16.0682L17.5635 16.0669C18.612 15.5573 19.37 15.1889 21.7718 18.1049C22.1824 18.6054 22.3395 19.1059 22.2507 19.6335C22.0459 20.8468 20.6354 21.9334 20.2086 22.1977C18.68 23.2876 14.9999 22.4068 9.25388 16.6619C3.51004 10.917 2.62821 7.23692 3.75704 5.64983C3.98238 5.28258 5.07329 3.86992 6.28446 3.66517Z"
                              fill="#050B20"
                            />
                          </svg>
                        </span>
                        {t("Phone")}
                      </h6>
                      <div className="text">
                        <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
                      </div>
                    </div>
                    <div className="content-box">
                      <h6 className="title">
                        <span className="icon">
                          <svg
                            width={26}
                            height={26}
                            viewBox="0 0 26 26"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12.7584 14.5869C12.0336 14.5869 11.3111 14.3474 10.7065 13.8686L5.84779 9.95128C5.49787 9.66962 5.44371 9.1572 5.72429 8.80837C6.00704 8.46062 6.51837 8.40537 6.86721 8.68595L11.7216 12.5989C12.3316 13.0821 13.1906 13.0821 13.8049 12.5946L18.6106 8.68812C18.9594 8.4032 19.4707 8.45737 19.7546 8.8062C20.0373 9.15395 19.9842 9.66528 19.6365 9.94912L14.8221 13.8621C14.2133 14.3453 13.4853 14.5869 12.7584 14.5869Z"
                              fill="#E1E1E1"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M18.0472 21.6667C18.0493 21.6645 18.058 21.6667 18.0645 21.6667C19.3006 21.6667 20.3969 21.2247 21.2376 20.3851C22.2137 19.4133 22.7499 18.0169 22.7499 16.4537V9.01333C22.7499 5.98758 20.7718 3.79166 18.0472 3.79166H7.411C4.68642 3.79166 2.70825 5.98758 2.70825 9.01333V16.4537C2.70825 18.0169 3.24558 19.4133 4.22058 20.3851C5.06125 21.2247 6.15867 21.6667 7.39367 21.6667H18.0472ZM7.39042 23.2917C5.71883 23.2917 4.226 22.685 3.07334 21.5367C1.78959 20.2562 1.08325 18.4513 1.08325 16.4537V9.01333C1.08325 5.11008 3.8035 2.16666 7.411 2.16666H18.0472C21.6547 2.16666 24.3749 5.11008 24.3749 9.01333V16.4537C24.3749 18.4513 23.6686 20.2562 22.3848 21.5367C21.2333 22.6839 19.7393 23.2917 18.0645 23.2917H7.39042Z"
                              fill="#050B20"
                            />
                          </svg>
                        </span>
                        {t("Email")}
                      </h6>
                      <div className="text">
                        <a href={`mailto:${EMAIL_ADDRESS}`}>{EMAIL_ADDRESS}</a>
                      </div>
                    </div>
                    <div className="content-box social-icons">
                      <h6 className="title">{t("Follow us")}</h6>
                      <ul className="social-links">
                        <li>
                          <a
                            href="https://www.facebook.com/people/Rent-a-Car-Montenegro/61578262611560/?rdid=NfaRO67sVlHn1I9D&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1FirRkUgda%2F%3Fref%3D1"
                            aria-label="Facebook"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="fa-brands fa-facebook-f" />
                          </a>
                        </li>
                        <li>
                          <a
                            href="https://www.instagram.com/carrentalmontenegro?igsh=dXEzcGhhY25jM3lv"
                            aria-label="Instagram"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
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
        </div>
        {/* End calculater-section */}
      </div>
    </section>
  );
}
