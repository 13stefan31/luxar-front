"use client";
import React from "react";
import Image from "next/image";
import {
  carBrands,
  contactItems,
  navItems,
  socialMediaLinks,
  vehicleTypes,
} from "@/data/footerLinks";
import Link from "@/components/common/LocalizedLink";
import { useLanguage } from "@/context/LanguageContext";
export default function Footer1({
  parentClass = "boxcar-footer footer-style-one cus-st-1",
}) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  return (
    <footer className={parentClass}>
      <div className="footer-top">
        <div className="boxcar-container">
          <div className="right-box">
            <div className="top-left wow fadeInUp">
              <h6 className="title">{t("Your journey starts here")}</h6>
              <div className="text">
                {t(
                  "Rent a car quickly and easily – pickup at the airport, in the city, or at your location."
                )}
              </div>
            </div> 
          </div>
        </div>
      </div> 
      {/*  Footer Bottom */}
      <div className="footer-bottom">
        <div className="boxcar-container">
          <div className="inner-container">
            <div className="copyright-text wow fadeInUp">
              © <a href="#">{year} {t("All rights reserved.")}</a>
            </div>
            <ul className="footer-nav wow fadeInUp" data-wow-delay="200ms">
              <li>
                <a href="#">{t("Terms & Conditions")}</a>
              </li> 
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
