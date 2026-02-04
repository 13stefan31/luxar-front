"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function SelectComponent({
  options = ["New York", "Los Vegas", "California"],
  value,
  onChange,
  hideEmptyOption = false,
}) {
  const [isDromdownOpen, setIsDromdownOpen] = useState(false);
  const normalizedOptions = useMemo(
    () =>
      options
        .map((option) => {
          if (option && typeof option === "object") {
            const label =
              option.label !== undefined ? option.label : option.value;
            return {
              label: String(label ?? ""),
              value:
                option.value !== undefined ? String(option.value) : String(label ?? ""),
            };
          }
          return {
            label: String(option ?? ""),
            value: String(option ?? ""),
          };
        }),
    [options]
  );
  const isControlled = value !== undefined;
  const [selectedValue, setSelectedValue] = useState(
    isControlled ? String(value ?? "") : normalizedOptions[0]?.value ?? ""
  );
  const ref = useRef(null);
  const handleClickOutside = (event) => {
    // Check if the click was outside the referenced element
    if (ref.current && !ref.current.contains(event.target)) {
      setIsDromdownOpen(false); // Close the element or perform an action
    }
  };

  useEffect(() => {
    // Add event listener on mount
    document.addEventListener("click", handleClickOutside);

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isControlled) {
      setSelectedValue(String(value ?? ""));
      return;
    }
    if (!normalizedOptions.find((option) => option.value === selectedValue)) {
      setSelectedValue(normalizedOptions[0]?.value ?? "");
    }
  }, [isControlled, normalizedOptions, selectedValue, value]);

  const selectedOption =
    normalizedOptions.find((option) => option.value === selectedValue) ||
    normalizedOptions[0];
  const dropdownOptions = useMemo(() => {
    if (!hideEmptyOption) {
      return normalizedOptions;
    }
    return normalizedOptions.filter((option) => option.value !== "");
  }, [hideEmptyOption, normalizedOptions]);

  return (
    <div ref={ref} className={`drop-menu  ${isDromdownOpen ? "active" : ""} `}>
      <div className="select" onClick={() => setIsDromdownOpen((pre) => !pre)}>
        <span>{selectedOption?.label ?? ""}</span>
        <i className="fa fa-angle-down" />
      </div>

      <ul
        className="dropdown"
        style={
          isDromdownOpen
            ? {
                display: "block",
                opacity: 1,
                visibility: "visible",
                transition: "0.4s",
              }
            : {
                display: "block",
                opacity: 0,
                visibility: "hidden",
                transition: "0.4s",
              }
        }
      >
        {dropdownOptions.map((option, index) => (
          <li
            onClick={() => {
              if (onChange) {
                onChange(option.value);
              }
              if (!isControlled) {
                setSelectedValue(option.value);
              }
              setIsDromdownOpen(false);
            }}
            key={index}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
