"use client";
import React from "react";
import {
  BadgePercent,
  ShieldCheck,
  Receipt,
  Car,
  MapPin,
  Plane,
  Mountain,
  Users,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Features2() {
  const { t } = useLanguage();
  const iconProps = {
    className: "featureIcon",
    size: 30,
    strokeWidth: 1.8,
    "aria-hidden": true,
  };
  return (
    <section className="why-choose-us-section">
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp">
          <h2 className="title">{t("Why us?")}</h2>
        </div>
        <div className="row">
          {/* choose-us-block */}
          <div className="choose-us-block col-lg-3 col-md-6 col-sm-12">
            <div className="inner-box wow fadeInUp">
              <div className="icon-box">
                <BadgePercent {...iconProps} />
              </div>
              <div className="content-box">
                <h6 className="title">{t("Special rental offers")}</h6>
                <div className="text">
                  {t(
                    "We offer flexible rental packages and special deals tailored to your budget and needs."
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* choose-us-block */}
          <div className="choose-us-block col-lg-3 col-md-6 col-sm-12">
            <div className="inner-box wow fadeInUp" data-wow-delay="100ms">
              <div className="icon-box">
                <ShieldCheck {...iconProps} />
              </div>
              <div className="content-box">
                <h6 className="title">{t("Reliable service")}</h6>
                <div className="text">
                  {t(
                    "With thousands of satisfied customers, we guarantee full transparency and reliability with every rental."
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* choose-us-block */}
          <div className="choose-us-block col-lg-3 col-md-6 col-sm-12">
            <div className="inner-box wow fadeInUp" data-wow-delay="200ms">
              <div className="icon-box">
                <Receipt {...iconProps} />
              </div>
              <div className="content-box">
                <h6 className="title">{t("Transparent pricing")}</h6>
                <div className="text">
                  {t(
                    "No hidden costs — you know the total rental price upfront and everything included."
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* choose-us-block */}
          <div className="choose-us-block col-lg-3 col-md-6 col-sm-12">
            <div className="inner-box wow fadeInUp" data-wow-delay="300ms">
              <div className="icon-box">
                <Car {...iconProps} />
              </div>
              <div className="content-box">
                <h6 className="title">
                  {t("Professionally maintained vehicles")}
                </h6>
                <div className="text">
                  {t(
                    "Our vehicles undergo regular servicing and strict inspections so you can travel safely and worry-free."
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          {/* choose-us-block */}
          <div className="choose-us-block col-lg-3 col-md-6 col-sm-12">
            <div className="inner-box wow fadeInUp">
              <div className="icon-box">
                <MapPin {...iconProps} />
              </div>
              <div className="content-box">
                <h6 className="title">{t("Country-Wide Delivery")}</h6>
                <div className="text">
                  {t(
                    "Rent a car from anywhere in Montenegro, and we will deliver it to you, so your trip starts exactly where you need it."
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* choose-us-block */}
          <div className="choose-us-block col-lg-3 col-md-6 col-sm-12">
            <div className="inner-box wow fadeInUp" data-wow-delay="100ms">
              <div className="icon-box">
                <Plane {...iconProps} />
              </div>
              <div className="content-box">
                <h6 className="title">{t("Airport Pickup & Drop-off")}</h6>
                <div className="text">
                  {t(
                    "Your rental is ready when you land, with fast pickup and easy return."
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* choose-us-block */}
          <div className="choose-us-block col-lg-3 col-md-6 col-sm-12">
            <div className="inner-box wow fadeInUp" data-wow-delay="200ms">
              <div className="icon-box">
                <Mountain {...iconProps} />
              </div>
              <div className="content-box">
                <h6 className="title">{t("Perfect for Mountains & Coast")}</h6>
                <div className="text">
                  {t(
                    "Our vehicles let you explore coastal roads, mountain views, and every scenic route in between."
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* choose-us-block */}
          <div className="choose-us-block col-lg-3 col-md-6 col-sm-12">
            <div className="inner-box wow fadeInUp" data-wow-delay="300ms">
              <div className="icon-box">
                <Users {...iconProps} />
              </div>
              <div className="content-box">
                <h6 className="title">{t("Local Experts, Not a Chain")}</h6>
                <div className="text">
                  {t(
                    "We're family owned car rental in Montenegro who knows the roads, routes, and real Montenegro."
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
