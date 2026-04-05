"use client";
import React from "react";
import PhoneInputLib from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function PhoneInput({ value, onChange, id, required }) {
  return (
    <PhoneInputLib
      id={id}
      international
      defaultCountry="ME"
      value={value}
      onChange={(val) => onChange(val || "")}
      required={required}
      className="phone-input-wrapper"
    />
  );
}
