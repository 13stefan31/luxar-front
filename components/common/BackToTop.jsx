"use client";
import React, { useState, useEffect } from "react";
import { useFloatingAction } from "@/context/FloatingActionContext";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { reserveAction } = useFloatingAction() || {};

  // Show button when scrolled 200px
  const toggleVisibility = () => {
    if (window.pageYOffset > 200) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll to the top
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  return (
    <div className="floating-actions">
      {reserveAction?.label && reserveAction?.onClick && (
        <button
          type="button"
          className="reserve-vehicle-float"
          onClick={reserveAction.onClick}
          aria-label={reserveAction.label}
          title={reserveAction.label}
        >
          {reserveAction.label}
        </button>
      )}
      <a
        className="whatsapp-float"
        href="https://wa.me/38267123456"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <span className="fa-brands fa-whatsapp"></span>
      </a>
      {isVisible && (
        <button
          type="button"
          className="scroll-to-top scroll-to-target"
          onClick={scrollToTop}
          style={{ display: "block" }}
          aria-label="Back to top"
        >
          <span className="fa fa-angle-up"></span>
        </button>
      )}
    </div>
  );
};

export default BackToTop;
