"use client";
import React from "react";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

const MONTENEGRO_ROAD_TRIP_ID = 4;

const MONTENEGRO_ROAD_TRIP_TOC = [
  { id: "why-road-trip", label: "Why Road Trip in Montenegro is a MUST" },
  {
    id: "public-transport-limits",
    label: "Why Public Transport Will Limit Your Trip and Car Hire Won't",
  },
  { id: "roads-driving", label: "Roads, Driving & What to Expect" },
  {
    id: "highlights",
    label: "Ready For Your Road Trip in Montenegro? Here Are Some Highlights",
    children: [
      { id: "bay-of-kotor", label: "Bay of Kotor" },
      { id: "lovcen", label: "Lovćen National Park" },
      { id: "skadar", label: "Skadar Lake National Park" },
      { id: "durmitor", label: "Durmitor National Park & Tara Canyon" },
      { id: "cetinje", label: "Cetinje & Old Royal Montenegro" },
    ],
  },
  {
    id: "itineraries",
    label: "Montenegro Road Trip Itineraries",
    children: [
      { id: "itinerary-1-day", label: "1 Day in Montenegro by Car" },
      { id: "itinerary-3-day", label: "Three-Day Montenegro Road Trip" },
      { id: "itinerary-5-day", label: "Five-Day Montenegro Road Trip" },
      { id: "itinerary-7-day", label: "Seven Days in Montenegro by Car" },
    ],
  },
  { id: "practical-tips", label: "Practical Car Rental Tips for Montenegro" },
  {
    id: "final-thoughts",
    label: "Final Thoughts: Is the Montenegro Road Trip Really Worth It?",
  },
];

const MONTENEGRO_ROAD_TRIP_TRANSPORT_LIMITS = [
  "Fewer departures in the off-season",
  "Fixed schedules that don’t align with sightseeing plans",
  "Stops in multiple towns along the way, which significantly extend travel time",
  "Shorter daylight in winter times = day wasted",
  "No direct access to mountain viewpoints, panoramic roads, or national park interiors",
];

const MONTENEGRO_ROAD_TRIP_DRIVING_NOTES = [
  "Roads can be narrow in mountainous areas",
  "Driving is safe, but requires attention on curves",
  "Distances are short, but scenery encourages slow travel",
  "A standard car is perfectly suited for Montenegro’s roads.",
];

const MONTENEGRO_ROAD_TRIP_ONE_DAY_STOPS = [
  "Walk through Kotor Old Town",
  "Coffee in Perast by the sea",
  "Drive the Kotor serpentine road",
  "Visit Lovćen Mausoleum",
  "Return",
];

const MONTENEGRO_ROAD_TRIP_THREE_DAY_PLAN = [
  "Day 1: Bay of Kotor (Kotor, Perast, Tivat, Cable Car, viewpoints)",
  "Day 2: Lovćen National Park - Cetinje - River of Crnojevic boat ride",
  "Day 3: Skadar Lake, Virpazar boat ride - St. Stefan viewpoint and Budva Old Town",
];

const MONTENEGRO_ROAD_TRIP_FIVE_DAY_PLAN = [
  "Days 1–2: Bay of Kotor, Budva, Sveti Stefan",
  "Day 3-4: Durmitor National Park",
  "Day 5: Return - Niksic, Ostrog Monastery",
];

const MONTENEGRO_ROAD_TRIP_SEVEN_DAY_PLAN = [
  "Day 1: Kotor & Bay of Kotor",
  "Day 2: Lovćen, Cetinje, River of Crnojevic",
  "Day 3: Budva - beaches, food, drinks",
  "Day 4, 5 & 6: Drive north - Ostrog Monastery Stop, Durmitor, Tara Canyon, Durmitor Ring Road",
  "Day 7: Relaxed return via Piva Lake & scenic stops",
];

const MONTENEGRO_ROAD_TRIP_PRACTICAL_TIPS = [
  "Book early in summer (June–September)",
  "Use offline maps for mountain regions",
  "Fuel stations are common on main roads, fewer in the mountains",
  "Park outside the old towns and walk in",
  "Drive patiently - scenery deserves it",
];
export default function BlogsSingle({ blogItem }) {
  const { t } = useLanguage();
  const title = blogItem?.title ? t(blogItem.title) : "";
  const date =
    blogItem?.date || blogItem?.datePublished
      ? t(blogItem?.date || blogItem?.datePublished)
      : null;
  const imageSrc =
    blogItem?.imageSrc ||
    blogItem?.src ||
    blogItem?.imgSrc ||
    "/images/placeholder.svg";
  const isMontenegroRoadTrip =
    blogItem?.slug === "montenegro-road-trip" ||
    blogItem?.id === MONTENEGRO_ROAD_TRIP_ID;
  return (
    <section className="blog-section-five layout-radius">
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp">
          <ul className="breadcrumb">
            <li>
              <Link href={`/`}>{t("Home")}</Link>
            </li>
            <li>
              <Link href={`/blog-list-01`}>{t("Blog")}</Link>
            </li>
            <li>
              <span>{title || t("Blog")}</span>
            </li>
          </ul>
          {date ? (
            <ul className="post-info">
              <li>{date}</li>
            </ul>
          ) : null}
          <h2>{title}</h2>
          {isMontenegroRoadTrip ? (
            <div className="blog-subtitle">
              {t(
                "Why public transport will limit you + best regions to explore by car"
              )}
            </div>
          ) : null}
        
        </div>
      </div>
      <div className="right-box">
        <div className="large-container">
          <div className="content-box"> 
            <div className="right-box-two">  
              <div className="image-sec">
                <div className="image-box">
                  <figure className="inner-image">
                    <Image
                      alt={title}
                      width={924}
                      height={450}
                      src={imageSrc}
                    />
                  </figure>
                </div>

                {isMontenegroRoadTrip ? (
                  <div className="blog-content">
                    <p className="text blog-tldr"> 
                      {t(
                        "A Montenegro road trip is the best way to experience the country’s incredible diversity in a short amount of time. Public transport can be slow and infrequent, depending on the time of year, limiting where and when you can explore. Renting a car in Montenegro gives you the freedom to discover coastal drives, mountain viewpoints, national parks, and historic towns at your own pace. This guide explains why a car rental is essential and how to plan the perfect 1, 3, 5, or 7-day itinerary for first-time visitors."
                      )}
                    </p>

                    <div className="blog-toc">
                      <h3>{t("Table of Contents")}</h3>
                      <ol className="blog-list">
                        {MONTENEGRO_ROAD_TRIP_TOC.map((item) => (
                          <li key={item.id}>
                            <a href={`#${item.id}`}>{t(item.label)}</a>
                            {item.children?.length ? (
                              <ol className="blog-sublist">
                                {item.children.map((child) => (
                                  <li key={child.id}>
                                    <a href={`#${child.id}`}>
                                      {t(child.label)}
                                    </a>
                                  </li>
                                ))}
                              </ol>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    </div>

                    <section id="why-road-trip">
                      <h3>{t("Why Road Trip in Montenegro is a MUST")}</h3>
                      <p className="text">
                        {t(
                          "Montenegro may be one of Europe’s smallest countries, but it delivers an incredible mix of landscapes: medieval coastal towns, dramatic mountain roads, deep river canyons, and peaceful lakes - often all within a few hours’ drive."
                        )}
                      </p>
                      <p className="text">
                        {t(
                          "If this is your first Montenegro road trip, renting a car is more than a convenience. A rental car allows you to travel beyond tourist hubs, stop at scenic viewpoints, explore national parks, and visit villages that buses simply don’t reach."
                        )}
                      </p>
                      <p className="text">
                        {t(
                          "When you rent a car in Montenegro, you experience the country as it’s meant to be seen: slowly, freely, and on your own terms."
                        )}
                      </p>
                    </section>

                    <section id="public-transport-limits">
                      <h3>
                        {t(
                          "Why Public Transport Will Limit Your Trip and Car Hire Won't"
                        )}
                      </h3>
                      <p className="text">
                        {t(
                          "Public transport in Montenegro connects major towns and many smaller cities, but it comes with clear limitations. Especially for travelers who want flexibility."
                        )}
                      </p>
                      <ul className="blog-list">
                        {MONTENEGRO_ROAD_TRIP_TRANSPORT_LIMITS.map((item) => (
                          <li key={item}>{t(item)}</li>
                        ))}
                      </ul>
                      <p className="text">
                        {t(
                          "While buses do run between coastal and inland cities, journeys often include multiple stops, making relatively short distances take much longer. What could be a 2-hour scenic drive can easily turn into half a day in transit. Add waiting times between connections, and you’ve lost valuable exploration time."
                        )}
                      </p>
                      <p className="text">
                        {t(
                          "Places like Lovćen National Park viewpoints, remote Skadar Lake roads, the Durmitor Ring, or hidden coastal villages are technically reachable, but not realistically accessible without serious planning and time sacrifice."
                        )}
                      </p>
                      <p className="text">
                        {t(
                          "With car hire in Montenegro, you’re not tied to timetables or indirect routes. You choose when to leave, where to stop, how long to stay, and which scenic road to take next. That flexibility is what turns a trip into a real Montenegro road experience."
                        )}
                      </p>
                    </section>

                    <section id="roads-driving">
                      <h3>{t("Roads, Driving & What to Expect")}</h3>
                      <p className="text">
                        {t(
                          "Montenegro’s main roads are well-maintained and incredibly scenic. Coastal routes offer sea views and charming towns, while mountain roads reward careful drivers with breathtaking panoramas."
                        )}
                      </p>
                      <h4>{t("What to know:")}</h4>
                      <ul className="blog-list">
                        {MONTENEGRO_ROAD_TRIP_DRIVING_NOTES.map((item) => (
                          <li key={item}>{t(item)}</li>
                        ))}
                      </ul>
                    </section>

                    <section id="highlights">
                      <h3>
                        {t(
                          "Ready For Your Road Trip in Montenegro? Here Are Some Highlights"
                        )}
                      </h3>

                      <h4 id="bay-of-kotor">
                        {t("Bay of Kotor (Boka Bay)")}
                      </h4>
                      <p className="text">
                        {t(
                          "The Bay of Kotor feels like a fjord carved into the Adriatic. With a rental car, you can drive the entire bay, stop in Perast, visit Our Lady of the Rocks with a taxi boat, explore Kotor Old Town, and enjoy viewpoints inaccessible by bus."
                        )}
                      </p>
                      <h4 id="lovcen">
                        {t("Lovćen National Park & Njegoš Mausoleum")}
                      </h4>
                      <p className="text">
                        {t(
                          "The road up Lovćen is one of Montenegro’s most iconic drives. From the top, you’ll see half the country on a clear day. This area is deeply tied to Montenegrin history and identity, centered around poet-ruler Petar II Petrović-Njegoš."
                        )}
                      </p>

                      <h4 id="skadar">{t("Skadar Lake National Park")}</h4>
                      <p className="text">
                        {t(
                          "The Balkans’ largest lake is a paradise of wetlands, birdlife, and riverside villages. A car lets you explore multiple access points, hidden viewpoints, and charming towns like Virpazar and Rijeka Crnojevića."
                        )}
                      </p>

                      <h4 id="durmitor">
                        {t("Durmitor National Park & Tara Canyon")}
                      </h4>
                      <p className="text">
                        {t(
                          "Northern Montenegro offers alpine scenery, glacial lakes, and the Tara River Canyon - one of the deepest in Europe. The Durmitor Ring Road is a highlight for anyone using a car rental in Montenegro to explore beyond the coast."
                        )}
                      </p>

                      <h4 id="cetinje">
                        {t("Cetinje & Old Royal Montenegro")}
                      </h4>
                      <p className="text">
                        {t(
                          "Once the royal capital, Cetinje is the cultural heart of the country. Museums, embassies, monasteries, and nearby mountain roads make it an essential stop when traveling inland."
                        )}
                      </p>
                    </section>

                    <section id="itineraries">
                      <h3>{t("Montenegro Road Trip Itineraries")}</h3>

                      <h4 id="itinerary-1-day">
                        {t("One Day in Montenegro by Car")}
                      </h4>
                      <p className="text">
                        <strong>{t("Best for:")}</strong>{" "}
                        {t("Short visits or cruise travelers")}
                      </p>
                      <p className="text">
                        <strong>{t("Route:")}</strong>{" "}
                        {t("Kotor - Perast - Lovćen Mausoleum - return")}
                      </p>
                      <ul className="blog-list">
                        {MONTENEGRO_ROAD_TRIP_ONE_DAY_STOPS.map((item) => (
                          <li key={item}>{t(item)}</li>
                        ))}
                      </ul>
                      <p className="text">
                        {t(
                          "This route packs coast, mountains, and history into one unforgettable day, only possible with a car."
                        )}
                      </p>
                      <p className="text">
                        {t("If you are limited in time, adjust accordingly.")}
                      </p>

                      <h4 id="itinerary-3-day">
                        {t("Three-Day Montenegro Road Trip")}
                      </h4>
                      <p className="text">
                        <strong>{t("Best for:")}</strong> {t("Weekend travelers")}
                      </p>
                      <ul className="blog-list">
                        {MONTENEGRO_ROAD_TRIP_THREE_DAY_PLAN.map((item) => (
                          <li key={item}>{t(item)}</li>
                        ))}
                      </ul>
                      <p className="text">
                        {t(
                          "This itinerary balances scenic drives, culture, and nature without long daily distances."
                        )}
                      </p>

                      <h4 id="itinerary-5-day">
                        {t("Five-Day Montenegro Road Trip")}
                      </h4>
                      <p className="text">
                        <strong>{t("Best for:")}</strong>{" "}
                        {t("Coast + interior exploration")}
                      </p>
                      <ul className="blog-list">
                        {MONTENEGRO_ROAD_TRIP_FIVE_DAY_PLAN.map((item) => (
                          <li key={item}>{t(item)}</li>
                        ))}
                      </ul>
                      <p className="text">
                        {t(
                          "This plan lets you slow down and explore Montenegro beyond postcard stops."
                        )}
                      </p>

                      <h4 id="itinerary-7-day">
                        {t("Seven Days in Montenegro by Car")}
                      </h4>
                      <p className="text">
                        <strong>{t("Best for:")}</strong>{" "}
                        {t("First-timers who want it all")}
                      </p>
                      <ul className="blog-list">
                        {MONTENEGRO_ROAD_TRIP_SEVEN_DAY_PLAN.map((item) => (
                          <li key={item}>{t(item)}</li>
                        ))}
                      </ul>
                    </section>

                    <section id="practical-tips">
                      <h3>{t("Practical Car Rental Tips for Montenegro")}</h3>
                      <ul className="blog-list">
                        {MONTENEGRO_ROAD_TRIP_PRACTICAL_TIPS.map((item) => (
                          <li key={item}>{t(item)}</li>
                        ))}
                      </ul>
                    </section>

                    <section id="final-thoughts">
                      <h3>
                        {t(
                          "Final Thoughts: Is the Montenegro Road Trip Really Worth It?"
                        )}
                      </h3>
                      <p className="text">
                        {t(
                          "Absolutely. Montenegro is not a country you rush through. It’s one you explore. Public transport shows you fragments; a car shows you the full picture."
                        )}
                      </p>
                      <p className="text">
                        {t(
                          "With car rental in Montenegro, you unlock coastal drives, mountain panoramas, national parks, historic towns, and spontaneous moments that become the highlights of your trip. If freedom, flexibility, and discovery matter to you, then a Montenegro road trip shouldn’t come optional, but as the key turned to experiencing the real Montenegro."
                        )}
                      </p>
                    </section>
                  </div>
                ) : (
                  <div className="text"> 
                  </div>
                )}
              </div> 
                 
            </div>
          </div>
        </div>
      </div> 
    </section>
  );
}
