"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Image from "next/image";
import Pagination from "../common/Pagination";
import {
  adminGetCars,
  adminLogout,
} from "@/lib/adminApi";
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
    const rawCapacity = String(capacity).trim();
    if (rawCapacity) {
      parts.push(rawCapacity);
    }
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

const INTERACTIVE_ROW_SELECTOR =
  "a,button,input,select,textarea,label,[role='button']";

const isInteractiveTarget = (target) =>
  target instanceof Element &&
  Boolean(target.closest(INTERACTIVE_ROW_SELECTOR));

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

const isUnauthorizedError = (status, message) =>
  status === 401 ||
  String(message || "").toLowerCase().includes("jwt token not found");

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
        const isUnauthorized = isUnauthorizedError(status, err?.message);
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
  const openVehicleDetails = (vehicleId) => {
    if (!vehicleId && vehicleId !== 0) {
      return;
    }
    router.push(`/admin/vozila/${vehicleId}`);
  };
  const handleVehicleRowClick = (event, vehicleId) => {
    if (isInteractiveTarget(event.target)) {
      return;
    }
    openVehicleDetails(vehicleId);
  };
  const handleVehicleRowKeyDown = (event, vehicleId) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    openVehicleDetails(vehicleId);
  };

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
                        <tr
                          key={`${item.id}-${index}`}
                          className="vehicle-row vehicle-row--clickable"
                          role="link"
                          tabIndex={0}
                          onClick={(event) =>
                            handleVehicleRowClick(event, item.id)
                          }
                          onKeyDown={(event) =>
                            handleVehicleRowKeyDown(event, item.id)
                          }
                          aria-label={`Otvori vozilo ${item.vehicleName}`}
                        >
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
