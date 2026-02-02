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
    <>
      {isVisible && (
        <div
          className="scroll-to-top scroll-to-target"
          onClick={scrollToTop}
          style={{ display: "block" }}
        >
          <span className="fa fa-angle-up"></span>
        </div>
      )}
    </>
  );
};

export default BackToTop;
