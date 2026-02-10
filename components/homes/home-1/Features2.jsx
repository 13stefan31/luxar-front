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
  const items = [
    {
      icon: BadgePercent,
      title: "Special rental offers",
      text: "We offer flexible rental packages and special deals tailored to your budget and needs.",
    },
    {
      icon: ShieldCheck,
      title: "Reliable service",
      text: "With thousands of satisfied customers, we guarantee full transparency and reliability with every rental.",
    },
    {
      icon: Receipt,
      title: "Transparent pricing",
      text: "No hidden costs — you know the total rental price upfront and everything included.",
    },
    {
      icon: Car,
      title: "Professionally maintained vehicles",
      text: "Our vehicles undergo regular servicing and strict inspections so you can travel safely and worry-free.",
    },
    {
      icon: MapPin,
      title: "Country-Wide Delivery",
      text: "Rent a car from anywhere in Montenegro, and we will deliver it to you, so your trip starts exactly where you need it.",
    },
    {
      icon: Plane,
      title: "Airport Pickup & Drop-off",
      text: "Your rental is ready when you land, with fast pickup and easy return.",
    },
    {
      icon: Mountain,
      title: "Perfect for Mountains & Coast",
      text: "Our vehicles let you explore coastal roads, mountain views, and every scenic route in between.",
    },
    {
      icon: Users,
      title: "Local Experts, Not a Chain",
      text: "We're family owned car rental in Montenegro who knows the roads, routes, and real Montenegro.",
    },
  ];
  const gridRef = React.useRef(null);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [collapseMetrics, setCollapseMetrics] = React.useState(null);
  const updateCollapseMetrics = React.useCallback(() => {
    const grid = gridRef.current;
    if (!grid) {
      setCollapseMetrics(null);
      return;
    }
    const cards = Array.from(grid.querySelectorAll(".choose-us-block"));
    if (cards.length < 3) {
      setCollapseMetrics(null);
      return;
    }
    const rowTops = Array.from(
      new Set(cards.map((card) => card.offsetTop))
    ).sort((a, b) => a - b);
    if (rowTops.length < 3) {
      setCollapseMetrics(null);
      return;
    }
    const measuredRowHeight = rowTops[1] - rowTops[0];
    const rowHeight =
      measuredRowHeight > 0 ? measuredRowHeight : cards[0].offsetHeight;
    const secondRowTop = rowTops[1];
    const visibleRowFraction = 0.82;
    const minBlurHeight = Math.max(80, Math.round(rowHeight * 0.35));
    let blurStart = secondRowTop + rowHeight * 0.05;
    const secondRowCard = cards.find((card) => card.offsetTop === secondRowTop);
    const titleEl = secondRowCard?.querySelector(".content-box .title");
    if (titleEl) {
      const titleRect = titleEl.getBoundingClientRect();
      const gridRect = grid.getBoundingClientRect();
      blurStart = titleRect.top - gridRect.top + titleRect.height * 0.1;
    }
    blurStart = Math.max(secondRowTop, blurStart);
    let height = secondRowTop + rowHeight * visibleRowFraction;
    if (height < blurStart + minBlurHeight) {
      height = blurStart + minBlurHeight;
    }
    const blurHeight = Math.ceil(height - blurStart);
    setCollapseMetrics({
      height: Math.ceil(height),
      blurHeight,
    });
  }, []);
  React.useLayoutEffect(() => {
    updateCollapseMetrics();
    if (typeof window === "undefined") {
      return undefined;
    }
    const handleResize = () => updateCollapseMetrics();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateCollapseMetrics]);
  const isCollapsed = !isExpanded && collapseMetrics !== null;
  const gridStyle = isCollapsed
    ? {
        maxHeight: `${collapseMetrics.height}px`,
        "--why-choose-us-blur-height": `${collapseMetrics.blurHeight}px`,
      }
    : undefined;
  const brandName = "Luxar";
  const heading = t("Why us?");
  const headingParts = heading.split(brandName);
  const headingContent =
    headingParts.length > 1
      ? headingParts.map((part, index) => (
          <React.Fragment key={`why-us-heading-${index}`}>
            {part}
            {index < headingParts.length - 1 ? (
              <span className="brand-gold-text">{brandName}</span>
            ) : null}
          </React.Fragment>
        ))
      : heading;
  return (
    <section className="why-choose-us-section">
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp">
          <h2 className="title">{headingContent}</h2>
        </div>
        <div
          className={`row why-choose-us-grid${isCollapsed ? " is-collapsed" : ""}`}
          id="why-choose-us-grid"
          ref={gridRef}
          style={gridStyle}
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            const delay = (index % 4) * 100;
            return (
              <div
                className="choose-us-block col-lg-3 col-md-6 col-sm-12"
                key={`${item.title}-${index}`}
              >
                <div
                  className="inner-box wow fadeInUp"
                  data-wow-delay={delay ? `${delay}ms` : undefined}
                >
                  <div className="icon-box">
                    <Icon {...iconProps} />
                  </div>
                  <div className="content-box">
                    <h3 className="title">{t(item.title)}</h3>
                    <div className="text">{t(item.text)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {isCollapsed ? (
          <div className="text-center mt-30">
            <button
              className="theme-btn why-choose-us-show-more"
              type="button"
              onClick={() => setIsExpanded(true)}
              aria-expanded={isExpanded}
              aria-controls="why-choose-us-grid"
            >
              {t("Show more")}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
