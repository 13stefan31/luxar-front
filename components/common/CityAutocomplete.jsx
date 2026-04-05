"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export default function CityAutocomplete({
  id,
  cities,
  value,
  onChange,
  placeholder,
  required,
}) {
  const [query, setQuery] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  const filtered = query
    ? cities.filter((city) =>
        city.name.toLowerCase().includes(query.toLowerCase())
      )
    : cities;

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex];
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightIndex, isOpen]);

  const selectCity = useCallback(
    (cityName) => {
      setQuery(cityName);
      onChange(cityName);
      setIsOpen(false);
      setHighlightIndex(-1);
    },
    [onChange]
  );

  const handleInputChange = (event) => {
    const val = event.target.value;
    setQuery(val);
    setIsOpen(true);
    setHighlightIndex(-1);
    if (!val) {
      onChange("");
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        setIsOpen(true);
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (highlightIndex >= 0 && filtered[highlightIndex]) {
          selectCity(filtered[highlightIndex].name);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  return (
    <div className="city-autocomplete" ref={wrapperRef}>
      <input
        id={id}
        type="text"
        autoComplete="off"
        required={required}
        value={query}
        placeholder={placeholder}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />
      {isOpen && filtered.length > 0 && (
        <ul className="city-autocomplete__list" ref={listRef} role="listbox">
          {filtered.map((city, index) => (
            <li
              key={city.id}
              role="option"
              aria-selected={index === highlightIndex}
              className={
                "city-autocomplete__item" +
                (index === highlightIndex
                  ? " city-autocomplete__item--active"
                  : "") +
                (city.name === value
                  ? " city-autocomplete__item--selected"
                  : "")
              }
              onMouseDown={() => selectCity(city.name)}
              onMouseEnter={() => setHighlightIndex(index)}
            >
              {city.name}
            </li>
          ))}
        </ul>
      )}
      {isOpen && filtered.length === 0 && query && (
        <ul className="city-autocomplete__list">
          <li className="city-autocomplete__empty">{placeholder}</li>
        </ul>
      )}
    </div>
  );
}
