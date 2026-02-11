"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Image from "next/image";
import Pagination from "../common/Pagination";
import { adminGetCars, adminLogout } from "@/lib/adminApi";
import {
  INVENTORY_API_ORIGIN,
  normalizeInventoryImageUrl,
} from "@/lib/inventoryApi";

const formatEngineLabel = (power, capacity, type) => {
  const parts = [];
  if (power) {
    parts.push(`${power} hp`);
  }
  if (capacity) {
    const liters = Number(capacity) / 1000;
    parts.push(`${liters.toFixed(1)}L`);
  }
  if (type) {
    parts.push(type);
  }
  return parts.join(" · ") || "—";
};

const transmissionDisplayName = (code) => {
  const mapping = {
    A: "Automatski",
    M: "Manuelni",
    H: "Hibridni",
    D: "Duploklavni",
    CVT: "CVT",
  };
  if (!code) {
    return "—";
  }
  return mapping[String(code).toUpperCase()] ?? code;
};

const fuelDisplayName = (code) => {
  const mapping = {
    P: "Benzin",
    D: "Dizel",
    E: "Električno",
    H: "Hibridno",
    G: "Gas",
  };
  if (!code) {
    return "—";
  }
  return mapping[String(code).toUpperCase()] ?? code;
};

const resolveImagePath = (image) => {
  if (!image) {
    return "";
  }
  if (typeof image === "string") {
    return image;
  }
  if (typeof image === "object") {
    return image.path || image.url || image.image || image.src || "";
  }
  return "";
};

const resolveRemoteImagePath = (image) => {
  const raw = resolveImagePath(image);
  if (!raw) {
    return "";
  }
  const normalized = normalizeInventoryImageUrl(raw, "");
  if (
    normalized &&
    /^\/?uploads\//i.test(normalized) &&
    INVENTORY_API_ORIGIN
  ) {
    const trimmed = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${INVENTORY_API_ORIGIN}${trimmed}`;
  }
  return normalized || raw;
};

const resolveCoverImage = (generatedImages = []) => {
  if (!Array.isArray(generatedImages)) {
    return null;
  }
  return (
    generatedImages.find((img) =>
      ["c", "cover", "main"].includes(String(img?.type || "").toLowerCase())
    ) || null
  );
};

const resolveCarCoverImage = (car) => {
  const generatedImages = Array.isArray(car?.generatedImages)
    ? car.generatedImages
    : [];
  const coverGenerated = resolveCoverImage(generatedImages);
  const candidates = [
    coverGenerated,
    car?.coverImage,
    car?.cover,
    car?.image,
    car?.image_url,
    car?.imageUrl,
    ...(Array.isArray(car?.images) ? car.images : []),
  ];
  for (const candidate of candidates) {
    const resolved = resolveRemoteImagePath(candidate);
    if (resolved) {
      return resolved;
    }
  }
  return "";
};

const normalizeInstances = (instances) => {
  if (!Array.isArray(instances)) {
    return [];
  }
  return instances.map((instance) => ({
    id: instance?.id ?? instance?.uuid ?? Math.random().toString(36).slice(2),
    registrationNumber:
      instance?.registrationNumber ||
      instance?.registrationNumber ||
      instance?.regNumber ||
      "—",
    uuid: instance?.uuid,
    additionalEquipment: instance?.additionalEquipment,
  }));
};

const getStatusTone = (status = "") => {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("publish") || normalized.includes("aktiv")) {
    return "status-pill__success";
  }
  if (normalized.includes("draft") || normalized.includes("pending")) {
    return "status-pill__muted";
  }
  if (normalized.includes("sold") || normalized.includes("closed")) {
    return "status-pill__warning";
  }
  return "status-pill__default";
};

const buildSecondaryMeta = (car) => {
  const candidates = [
    car?.make,
    car?.model,
    car?.trim,
    car?.alias,
  ]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .slice(0, 3);
  if (candidates.length) {
    return candidates.join(" · ");
  }
  if (car?.yearOfManufacture || car?.year) {
    return String(car?.yearOfManufacture || car?.year);
  }
  if (car?.registrationNumber) {
    return car.registrationNumber;
  }
  return "—";
};

const toTableRow = (car) => {
  const image = resolveCarCoverImage(car) || null;
  const instances = normalizeInstances(car?.instances || car?.instancesList);
  return {
    id: car?.id ?? car?.uuid ?? car?.vehicleName ?? car?.alias,
    vehicleName: car?.vehicleName || car?.alias || "—",
    alias: car?.alias || car?.vehicleName || "—",
    enginePower: car?.enginePower || car?.power || null,
    engineCapacity: car?.engine || car?.engineCapacity || null,
    engineType: car?.engineType || car?.engineFuelType || null,
    year: car?.yearOfManufacture || car?.year || "—",
    transmission:
      transmissionDisplayName(
        car?.transmissionType ||
          car?.transmission ||
          car?.gearbox ||
          car?.transmissionCode
      ),
    fuelType: fuelDisplayName(car?.fuelType || car?.fuel || car?.fuelCode),
    color: car?.colorItem || "—",
    seats: car?.seatsNumber ?? car?.seats ?? "—",
    doors: car?.doorNumber ?? car?.doors ?? "—",
    airConditioning: car?.doesHaveAirConditioning ?? car?.hasAirConditioning,
    equipment: car?.equipment ?? car?.features,
    instances,
    instanceSummary: instances
      .map((instance) => instance.registrationNumber)
      .filter(Boolean),
    image,
    secondaryMeta: buildSecondaryMeta(car),
    statusLabel: car?.status || car?.state || car?.condition || "Draft",
    statusTone: getStatusTone(car?.status || car?.state || car?.condition),
    variationsCount: instances.length,
  };
};

const normalizeCarsPayload = (payload) => {
  const sources = [
    payload?.cars,
    payload?.data,
    payload?.items,
    payload?.results,
    payload?.data?.items,
    payload?.data?.cars,
    payload?.data?.data,
    payload,
  ];
  const normalizedArray = sources.find((source) => Array.isArray(source)) ?? [];
  return normalizedArray.map(toTableRow);
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const extractPaginationMeta = (payload, fallbackPage, fallbackLimit) => {
  const meta =
    payload?.meta ||
    payload?.pagination ||
    payload?.data?.meta ||
    payload?.data?.pagination ||
    {};
  const perPage = toNumber(
    meta?.per_page ??
      meta?.perPage ??
      meta?.perPageSize ??
      meta?.itemsPerPage ??
      meta?.limit ??
      fallbackLimit,
    fallbackLimit ?? 0
  );
  const totalItems = toNumber(
    meta?.total ??
      meta?.totalItems ??
      meta?.total_records ??
      payload?.total ??
      payload?.records,
    0
  );
  const explicitTotalPages = toNumber(
    meta?.last_page ?? meta?.total_pages ?? meta?.totalPages ?? meta?.pages,
    null
  );
  const totalPages =
    explicitTotalPages && explicitTotalPages > 0
      ? explicitTotalPages
      : perPage
        ? Math.max(1, Math.ceil(totalItems / perPage))
        : 1;
  const currentPage = Math.max(
    1,
    toNumber(
      meta?.current_page ?? meta?.currentPage ?? meta?.page ?? fallbackPage,
      fallbackPage ?? 1
    )
  );

  return {
    currentPage,
    totalPages,
    totalItems,
    perPage,
  };
};

export default function MyListings() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadCars = async () => {
      setIsLoading(true);
      setError("");
      try {
        const payload = await adminGetCars({
          limit,
          page,
          signal: controller.signal,
        });
        const normalized = normalizeCarsPayload(payload);
        setRows(normalized);
        setPaginationMeta(extractPaginationMeta(payload, page, limit));
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }
        const status = err?.status ?? err?.payload?.code;
        const isUnauthorized =
          status === 401 ||
          String(err?.message || "")
            .toLowerCase()
            .includes("jwt token not found");
        if (isUnauthorized) {
          await adminLogout();
          router.replace("/admin");
          return;
        }

        setError(err?.message || "Neuspješno učitavanje vozila.");
        setRows([]);
        setPaginationMeta((prev) => ({
          ...prev,
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
        }));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadCars();
    return () => controller.abort();
  }, [limit, page, router]);

  const displayRows = rows;

  return (
    <section className="dashboard-widget">
      <div className="right-box">
        <Sidebar />
        <div className="content-column">
          <div className="inner-column">
            <div className="list-title header-with-action">
              <div>
                <ul className="breadcrumb">
                  <li>
                    <Link href="/admin/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <span>Vozila</span>
                  </li>
                </ul>
                <h2 className="title">Vozila</h2>
              </div>
              <Link
                href="/admin/add-listings"
                className="theme-btn admin-add-btn"
              >
                Dodaj vozilo
              </Link>
            </div>
            <div className="my-listing-table wrap-listing">
              {error && (
                <div className="alert-message">
                  Ne mogu da se učitaju vozila: {error}
                </div>
              )}
              <div className="cart-table">
                {/* <div className="title-listing">
                  <div className="box-ip-search">
                    <span className="icon">
                      <svg
                        width={14}
                        height={14}
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6.29301 0.287598C2.9872 0.287598 0.294312 2.98048 0.294312 6.28631C0.294312 9.59211 2.9872 12.2902 6.29301 12.2902C7.70502 12.2902 9.00364 11.7954 10.03 10.9738L12.5287 13.4712C12.6548 13.5921 12.8232 13.6588 12.9979 13.657C13.1725 13.6552 13.3395 13.5851 13.4631 13.4617C13.5867 13.3382 13.6571 13.1713 13.6591 12.9967C13.6611 12.822 13.5947 12.6535 13.474 12.5272L10.9753 10.0285C11.7976 9.00061 12.293 7.69995 12.293 6.28631C12.293 2.98048 9.59882 0.287598 6.29301 0.287598ZM6.29301 1.62095C8.87824 1.62095 10.9584 3.70108 10.9584 6.28631C10.9584 8.87153 8.87824 10.9569 6.29301 10.9569C3.70778 10.9569 1.62764 8.87153 1.62764 6.28631C1.62764 3.70108 3.70778 1.62095 6.29301 1.62095Z"
                          fill="#050B20"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      defaultValue="Pretraži vozila, npr. Audi Q7"
                    />
                  </div>
                </div> */}
                <table className="listing-table">
                  <thead>
                    <tr>
                      <th>Vozilo</th>
                      <th>Motor</th>
                      <th>Godina</th>
                      <th>Menjač</th>
                      <th>Gorivo</th>
                      <th>Varijante</th> 
                      <th className="text-end">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={8}>Učitavanje vozila...</td>
                      </tr>
                    ) : displayRows.length ? (
                      displayRows.map((item, index) => (
                        <tr key={`${item.id}-${index}`} className="vehicle-row">
                          <td>
                            <div className="vehicle-cell">
                              <div className="vehicle-thumb">
                                {item.image ? (
                                  <Image
                                    alt={item.vehicleName}
                                    src={item.image}
                                    width={80}
                                    height={80}
                                  />
                                ) : (
                                  <span
                                    className="listing-thumb-placeholder"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                              <div className="vehicle-cell-meta">
                                <div className="vehicle-name">{item.vehicleName}</div> 
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="vehicle-subdetail">
                              {formatEngineLabel(
                                item.enginePower,
                                item.engineCapacity 
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="vehicle-subdetail">{item.year}</div>
                          </td>
                          <td>
                            <div className="vehicle-subdetail">{item.transmission}</div>
                          </td>
                          <td>
                            <div className="vehicle-subdetail">{item.fuelType}</div>
                          </td>
                          <td>
                            <div className="variation-flag">
                              <span className="variation-count">
                                {item.variationsCount} varijacija
                              </span> 
                            </div>
                          </td> 
                          <td>
                            <div className="action-buttons">
                              <Link
                                href={`/admin/vozila/${item.id}`}
                                className="action-btn"
                                aria-label="Uredi vozilo"
                              >
                                <Image
                                  alt="Edit"
                                  src="/images/icons/edit.svg"
                                  width={16}
                                  height={16}
                                />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8}>
                          Nema dostupnih vozila. Pokušajte ponovo kasnije.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="pagination-sec">
                  <nav aria-label="Page navigation example">
                    <Pagination
                      currentPage={paginationMeta.currentPage}
                      totalPages={paginationMeta.totalPages}
                      onPageChange={setPage}
                    />
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
