"use client";
import React, { useState, useEffect } from "react";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

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
      <a
        className="whatsapp-float"
        href="https://wa.me/38267123456"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <span className="fa-brands fa-whatsapp"></span>
      </a>
    </div>
  );
};

export default BackToTop;
