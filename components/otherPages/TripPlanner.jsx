"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "@/components/common/LocalizedLink";
import { useLanguage } from "@/context/LanguageContext";

const parseDestinations = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getTripDays = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return null;
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
};

const buildRouteDays = (routeStops, totalDays, t) => {
  const days = [];
  const safeStops = routeStops.length ? routeStops : [t("Not specified")];
  const lastStop = safeStops[safeStops.length - 1];

  for (let i = 0; i < totalDays; i += 1) {
    const dayLabel = t("Day {count}", { count: i + 1 });
    let detail = "";
    if (safeStops.length === 1) {
      detail = t("Explore {place}", { place: safeStops[0] });
    } else if (i < safeStops.length - 1) {
      detail = t("Drive from {from} to {to}", {
        from: safeStops[i],
        to: safeStops[i + 1],
      });
    } else {
      detail = t("Flexible day in {place}", { place: lastStop });
    }
    days.push({ title: dayLabel, detail });
  }

  return days;
};

const pickVehicleKey = ({ travelers, luggage, style }) => {
  if (travelers >= 6 || luggage === "heavy") {
    return "van";
  }
  if (style === "mountain") {
    return "suv";
  }
  if (travelers <= 2 && luggage === "light" && style === "city") {
    return "economy";
  }
  return "sedan";
};

export default function TripPlanner() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    startLocation: "",
    destinations: "",
    startDate: "",
    endDate: "",
    travelers: "2",
    luggage: "medium",
    style: "balanced",
    transmission: "any",
  });
  const [plan, setPlan] = useState(null);

  const luggageOptions = useMemo(
    () => [
      { value: "light", label: t("Light (1-2 bags)") },
      { value: "medium", label: t("Medium (2-3 bags)") },
      { value: "heavy", label: t("Heavy (4+ bags)") },
    ],
    [t]
  );

  const styleOptions = useMemo(
    () => [
      { value: "city", label: t("City + culture") },
      { value: "coastal", label: t("Coastal + scenic") },
      { value: "mountain", label: t("Mountain + adventure") },
      { value: "balanced", label: t("Balanced pace") },
    ],
    [t]
  );

  const transmissionOptions = useMemo(
    () => [
      { value: "any", label: t("Any") },
      { value: "automatic", label: t("Automatic") },
      { value: "manual", label: t("Manual") },
    ],
    [t]
  );

  const vehicleCatalog = useMemo(
    () => ({
      economy: {
        label: t("Economy hatchback"),
        seats: "4",
        luggage: "2",
        reason: t("Best for city routes and short drives."),
      },
      sedan: {
        label: t("Comfort sedan"),
        seats: "5",
        luggage: "3",
        reason: t("Balanced comfort for couples and small families."),
      },
      suv: {
        label: t("Compact SUV"),
        seats: "5",
        luggage: "4",
        reason: t("Extra ground clearance for mountain roads."),
      },
      van: {
        label: t("Family van"),
        seats: "7-8",
        luggage: "5+",
        reason: t("Space for groups and large luggage."),
      },
    }),
    [t]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const travelers = Math.max(1, parseInt(form.travelers, 10) || 1);
    const destinations = parseDestinations(form.destinations);
    const startLocation = form.startLocation.trim();
    const totalDays =
      getTripDays(form.startDate, form.endDate) ||
      Math.max(destinations.length + 1, 3);

    const routeStops = [];
    if (startLocation) {
      routeStops.push(startLocation);
    }
    routeStops.push(...destinations);

    if (!routeStops.length) {
      routeStops.push(t("Not specified"));
    }

    const days = buildRouteDays(routeStops, totalDays, t);
    const vehicleKey = pickVehicleKey({
      travelers,
      luggage: form.luggage,
      style: form.style,
    });

    const summary = [
      {
        label: t("Start location"),
        value: startLocation || t("Not specified"),
      },
      {
        label: t("Destinations"),
        value: destinations.length
          ? destinations.join(", ")
          : t("Not specified"),
      },
      {
        label: t("Dates"),
        value:
          form.startDate && form.endDate
            ? `${form.startDate} - ${form.endDate}`
            : t("Flexible"),
      },
      {
        label: t("Travelers"),
        value: String(travelers),
      },
      {
        label: t("Luggage"),
        value:
          luggageOptions.find((item) => item.value === form.luggage)?.label ||
          t("Not specified"),
      },
      {
        label: t("Driving style"),
        value:
          styleOptions.find((item) => item.value === form.style)?.label ||
          t("Balanced pace"),
      },
      {
        label: t("Transmission"),
        value:
          transmissionOptions.find((item) => item.value === form.transmission)
            ?.label || t("Automatic or manual"),
      },
    ];

    setPlan({
      summary,
      totalDays,
      days,
      vehicle: vehicleCatalog[vehicleKey],
    });
  };

  const handleReset = () => {
    setForm({
      startLocation: "",
      destinations: "",
      startDate: "",
      endDate: "",
      travelers: "2",
      luggage: "medium",
      style: "balanced",
      transmission: "any",
    });
    setPlan(null);
  };

  const messages = useMemo(() => {
    const base = [
      {
        role: "assistant",
        text: t(
          "Hi! Share your plans and I’ll build a route with a vehicle recommendation."
        ),
      },
      {
        role: "assistant",
        text: t("Fill in the details below and click Generate plan."),
      },
    ];
    if (!plan) {
      return base;
    }
    return [
      ...base,
      {
        role: "user",
        summary: plan.summary,
      },
      {
        role: "assistant",
        text: t("Great! I’ve prepared a route and vehicle match."),
      },
    ];
  }, [plan, t]);

  return (
    <section className="trip-planner-section layout-radius">
      <div className="boxcar-container">
        <div className="boxcar-title-three wow fadeInUp">
          <ul className="breadcrumb">
            <li>
              <Link href={`/`}>{t("Home")}</Link>
            </li>
            <li>
              <span>{t("Trip Planner")}</span>
            </li>
          </ul>
        </div>

        <div className="boxcar-title">
          <h2>{t("Plan your trip")}</h2>
          <p>
            {t(
              "Tell us where you're going and we'll craft a day-by-day route with a recommended vehicle."
            )}
          </p>
        </div>

        <div className="trip-planner-grid">
          <div className="trip-chat">
            <div className="trip-chat__header">
              <div>
                <h3>{t("Chat assistant")}</h3>
                <p>{t("Your trip details")}</p>
              </div>
            </div>

            <div className="trip-chat__messages">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`trip-bubble trip-bubble--${message.role}`}
                >
                  {message.summary ? (
                    <div className="trip-summary">
                      <h5>{t("Here is your trip brief:")}</h5>
                      <div className="trip-summary__grid">
                        {message.summary.map((item) => (
                          <div className="trip-summary__item" key={item.label}>
                            <span>{item.label}</span>
                            <strong>{item.value}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p>{message.text}</p>
                  )}
                </div>
              ))}
            </div>

            <form className="trip-chat__form" onSubmit={handleSubmit}>
              <div className="trip-form-grid">
                <div className="form_boxes">
                  <label htmlFor="startLocation">{t("Start location")}</label>
                  <input
                    id="startLocation"
                    name="startLocation"
                    type="text"
                    value={form.startLocation}
                    onChange={handleChange}
                    placeholder={t("Enter location")}
                  />
                </div>

                <div className="form_boxes">
                  <label htmlFor="travelers">{t("Travelers")}</label>
                  <input
                    id="travelers"
                    name="travelers"
                    type="number"
                    min="1"
                    value={form.travelers}
                    onChange={handleChange}
                  />
                </div>

                <div className="form_boxes">
                  <label htmlFor="startDate">{t("Start date")}</label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form_boxes">
                  <label htmlFor="endDate">{t("End date")}</label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="form_boxes">
                  <label htmlFor="luggage">{t("Luggage")}</label>
                  <select
                    id="luggage"
                    name="luggage"
                    value={form.luggage}
                    onChange={handleChange}
                  >
                    {luggageOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form_boxes">
                  <label htmlFor="style">{t("Driving style")}</label>
                  <select
                    id="style"
                    name="style"
                    value={form.style}
                    onChange={handleChange}
                  >
                    {styleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form_boxes">
                  <label htmlFor="transmission">{t("Transmission")}</label>
                  <select
                    id="transmission"
                    name="transmission"
                    value={form.transmission}
                    onChange={handleChange}
                  >
                    {transmissionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form_boxes form_boxes--wide">
                  <label htmlFor="destinations">
                    {t("Destinations (comma-separated)")}
                  </label>
                  <textarea
                    id="destinations"
                    name="destinations"
                    value={form.destinations}
                    onChange={handleChange}
                    placeholder={t("Enter location")}
                  />
                </div>
              </div>

              <div className="trip-chat__actions">
                <button type="submit" className="theme-btn">
                  {t("Generate plan")}
                  <Image alt="" width={14} height={14} src="/images/arrow.svg" />
                </button>
                <button
                  type="button"
                  className="trip-btn-secondary"
                  onClick={handleReset}
                >
                  {t("Reset")}
                </button>
              </div>
            </form>
          </div>

          <aside className="trip-plan">
            {plan ? (
              <>
                <div className="trip-plan__header">
                  <h3>{t("Plan overview")}</h3>
                  <p>{t("Plan your trip")}</p>
                </div>

                <div className="trip-plan__stats">
                  <div className="trip-stat">
                    <span>{t("Total days")}</span>
                    <strong>{plan.totalDays}</strong>
                  </div>
                  <div className="trip-stat">
                    <span>{t("Route")}</span>
                    <strong>
                      {plan.summary.find(
                        (item) => item.label === t("Start location")
                      )?.value || t("Not specified")}
                    </strong>
                  </div>
                  <div className="trip-stat">
                    <span>{t("Focus")}</span>
                    <strong>
                      {plan.summary.find(
                        (item) => item.label === t("Driving style")
                      )?.value || t("Balanced pace")}
                    </strong>
                  </div>
                  <div className="trip-stat">
                    <span>{t("Travelers")}</span>
                    <strong>
                      {plan.summary.find(
                        (item) => item.label === t("Travelers")
                      )?.value || "-"}
                    </strong>
                  </div>
                </div>

                <div className="trip-plan__days">
                  {plan.days.map((day) => (
                    <div className="trip-day" key={day.title}>
                      <span>{day.title}</span>
                      <p>{day.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="trip-plan__vehicle">
                  <div className="trip-plan__vehicle-header">
                    <div>
                      <span>{t("Recommended vehicle")}</span>
                      <h4>{plan.vehicle.label}</h4>
                    </div>
                  </div>
                  <ul className="trip-plan__meta">
                    <li>
                      <span>{t("Seats")}</span>
                      <strong>{plan.vehicle.seats}</strong>
                    </li>
                    <li>
                      <span>{t("Luggage")}</span>
                      <strong>{plan.vehicle.luggage}</strong>
                    </li>
                    <li>
                      <span>{t("Transmission")}</span>
                      <strong>
                        {plan.summary.find(
                          (item) => item.label === t("Transmission")
                        )?.value || t("Automatic or manual")}
                      </strong>
                    </li>
                  </ul>
                  <div className="trip-plan__reason">
                    <h5>{t("Why this works")}</h5>
                    <p>{plan.vehicle.reason}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="trip-plan__empty">
                <h3>{t("No plan yet")}</h3>
                <p>
                  {t(
                    "Once you generate a plan, your day-by-day route and vehicle suggestion will appear here."
                  )}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
