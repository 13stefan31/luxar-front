"use client";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  adminGetCar,
  adminGetCarInstances,
  adminUpdateCar,
  adminUpdateCarInstance,
  adminDeleteCarInstance,
  adminCreateCarInstance,
  adminCreateCarPrices,
  adminGetCarPrices,
  adminUpdateCarPrice,
  adminDeleteCarPrice,
  adminLogout,
} from "@/lib/adminApi";
import { INVENTORY_API_ORIGIN, normalizeInventoryImageUrl } from "@/lib/inventoryApi";

const ENGINE_TYPE_OPTIONS = [
  { value: "", label: "Odaberi" },
  { value: "P", label: "P (benzin)" },
  { value: "D", label: "D (dizel)" },
  { value: "H", label: "H (hibrid)" },
];

const FUEL_TYPE_OPTIONS = [
  { value: "", label: "Odaberi" },
  { value: "P", label: "P (benzin)" },
  { value: "D", label: "D (dizel)" },
];

const TRANSMISSION_OPTIONS = [
  { value: "", label: "Odaberi" },
  { value: "A", label: "A (automatik)" },
  { value: "M", label: "M (manuelni)" },
  { value: "SA", label: "SA (polu automatik)" },
];

const normalizeInstancesData = (payload) => {
  const sources = [
    payload?.data,
    payload?.instances,
    payload?.items,
    payload,
  ];
  return sources.find((source) => Array.isArray(source)) ?? [];
};

const buildVariationKey = (instance, index) =>
  instance?.registrationNumber ||
  instance?.id ||
  instance?.uuid ||
  `variation-${index}`;

const getNextVariationNumber = (instances = []) => {
  const maxExisting = instances.reduce((max, instance) => {
    const current = Number(instance?.displayNumber);
    if (!Number.isFinite(current)) {
      return max;
    }
    return Math.max(max, current);
  }, 0);
  return maxExisting + 1;
};

const formatEngineLabel = (power, capacity, type) => {
  const parts = [];
  if (power) {
    parts.push(`${power} hp`);
  }
  if (capacity) {
    const liters = Number(capacity) / 1000;
    if (!Number.isNaN(liters)) {
      parts.push(`${liters.toFixed(1)}L`);
    }
  }
  if (type) {
    parts.push(type);
  }
  return parts.join(" · ") || "—";
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

const resolveImagePath = (image) => {
  if (!image) {
    return "";
  }
  if (typeof image === "string") {
    return image;
  }
  if (typeof image === "object") {
    return (
      image.path ||
      image.url ||
      image.image ||
      image.src ||
      ""
    );
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

const normalizeImageList = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }
  return images.map((image) => resolveRemoteImagePath(image)).filter(Boolean);
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

const MONTH_LABELS = [
  "Januar",
  "Februar",
  "Mart",
  "April",
  "Maj",
  "Jun",
  "Jul",
  "Avgust",
  "Septembar",
  "Oktobar",
  "Novembar",
  "Decembar",
];

const WEEKDAY_LABELS = ["Pon", "Uto", "Sri", "Cet", "Pet", "Sub", "Ned"];

const pad2 = (value) => String(value).padStart(2, "0");

const formatLocalDate = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
};

const formatDisplayDate = (value) => {
  const parsed = parseLocalDate(value);
  if (!parsed) {
    return "";
  }
  return `${pad2(parsed.getDate())}.${pad2(parsed.getMonth() + 1)}.${parsed.getFullYear()}`;
};

const parseLocalDate = (value) => {
  if (!value) {
    return null;
  }
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) {
    return null;
  }
  const parsed = new Date(year, month - 1, day);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const normalizeRemoteDate = (value) => {
  if (!value) {
    return "";
  }
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  if (typeof value === "object") {
    if (typeof value.date === "string") {
      return value.date.slice(0, 10);
    }
    if (typeof value.value === "string") {
      return value.value.slice(0, 10);
    }
  }
  return "";
};

const toDayNumber = (value) => {
  const parsed = parseLocalDate(value);
  if (!parsed) {
    return NaN;
  }
  return Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const startOfMonth = (date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date, delta) =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);

const buildCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  const days = [];

  for (let i = 0; i < totalCells; i += 1) {
    const dayNumber = i - startOffset + 1;
    let cellDate = null;
    let isCurrentMonth = true;

    if (dayNumber < 1) {
      cellDate = new Date(year, month - 1, daysInPrevMonth + dayNumber);
      isCurrentMonth = false;
    } else if (dayNumber > daysInMonth) {
      cellDate = new Date(year, month + 1, dayNumber - daysInMonth);
      isCurrentMonth = false;
    } else {
      cellDate = new Date(year, month, dayNumber);
    }

    const iso = formatLocalDate(cellDate);
    days.push({
      key: `${iso}-${i}`,
      label: cellDate ? cellDate.getDate() : "",
      iso,
      isCurrentMonth,
    });
  }

  return { year, month, days };
};

const calculateRangeDays = (startDate, endDate) => {
  const start = toDayNumber(startDate);
  const end = toDayNumber(endDate);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return 0;
  }
  return Math.floor((end - start) / 86400000) + 1;
};

const formatTierLabel = (tier) => {
  const minDays = tier?.minDays;
  const maxDays = tier?.maxDays;
  if (!minDays) {
    return "Nedefinisano";
  }
  if (!maxDays && maxDays !== 0) {
    return `${minDays}+ dana`;
  }
  if (Number(minDays) === Number(maxDays)) {
    return `${minDays} dana`;
  }
  return `${minDays} - ${maxDays} dana`;
};

const buildInstanceImageSet = (instance) => {
  const generatedImages = Array.isArray(instance?.generatedImages)
    ? instance.generatedImages
    : [];
  const coverGenerated = resolveCoverImage(generatedImages);
  const galleryGenerated = generatedImages.filter(
    (img) => img !== coverGenerated
  );
  const normalizedImages = normalizeImageList(instance?.images);
  const normalizedGenerated = normalizeImageList(galleryGenerated);
  const cover =
    resolveRemoteImagePath(coverGenerated) ||
    resolveRemoteImagePath(instance?.coverImage) ||
    resolveRemoteImagePath(instance?.image) ||
    normalizedImages[0] ||
    normalizedGenerated[0] ||
    "";
  const combinedGallery = [...normalizedImages, ...normalizedGenerated];
  const dedupedGallery = Array.from(new Set(combinedGallery));
  const gallery = dedupedGallery.filter((image) => image && image !== cover);
  return { cover, gallery };
};

export default function CarDetailsTabs({ carId }) {
  const router = useRouter();
  const [car, setCar] = useState(null);
  const [instances, setInstances] = useState([]);
  const [instanceEdits, setInstanceEdits] = useState({});
  const [instanceSaving, setInstanceSaving] = useState({});
  const [expandedVariations, setExpandedVariations] = useState({});
  const [newEquipment, setNewEquipment] = useState({});
  const [vehicleEquipmentDraft, setVehicleEquipmentDraft] = useState({
    key: "",
    value: "",
    isActive: true,
  });
  const [instanceDeleting, setInstanceDeleting] = useState({});
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingFocusVariationKey, setPendingFocusVariationKey] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverFallback, setCoverFallback] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [instanceCoverFiles, setInstanceCoverFiles] = useState({});
  const [instanceCoverPreviews, setInstanceCoverPreviews] = useState({});
  const [instanceGalleryFiles, setInstanceGalleryFiles] = useState({});
  const [instanceGalleryPreviews, setInstanceGalleryPreviews] = useState({});
  const [instanceExistingCovers, setInstanceExistingCovers] = useState({});
  const [instanceExistingGalleries, setInstanceExistingGalleries] = useState({});
  const variationRefs = useRef({});
  const registrationInputRefs = useRef({});
  const imageObjectUrlRef = useRef("");
  const galleryObjectUrlRef = useRef([]);
  const instanceCoverUrlsRef = useRef({});
  const instanceGalleryUrlsRef = useRef({});
  const [formValues, setFormValues] = useState({
    vehicleName: "",
    yearOfManufacture: "",
    transmissionType: "",
    fuelType: "",
    colorItem: "",
    enginePower: "",
    engine: "",
    engineType: "",
    seatsNumber: "",
    doorNumber: "",
    doesHaveAirConditioning: false,
    // description: "",
    equipment: {},
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [priceRange, setPriceRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [priceTiers, setPriceTiers] = useState([
    { minDays: 1, maxDays: "", price: "" },
  ]);
  const [priceErrors, setPriceErrors] = useState({});
  const [priceSaving, setPriceSaving] = useState(false);
  const [pricePeriods, setPricePeriods] = useState([]);
  const [priceMeta, setPriceMeta] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceLoadError, setPriceLoadError] = useState("");
  const [priceEditingId, setPriceEditingId] = useState(null);
  const [priceEditDrafts, setPriceEditDrafts] = useState({});
  const [priceEditErrors, setPriceEditErrors] = useState({});
  const [priceEditSaving, setPriceEditSaving] = useState({});
  const [priceDeleteLoading, setPriceDeleteLoading] = useState({});
  const [calendarMonth, setCalendarMonth] = useState(() =>
    startOfMonth(new Date())
  );

  useEffect(() => {
    if (!carId) {
      return;
    }
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [carPayload, instancesPayload] = await Promise.all([
          adminGetCar(carId, { signal: controller.signal }),
          adminGetCarInstances(carId, { signal: controller.signal }),
        ]);
        if (cancelled) {
          return;
        }
        const normalizedInstances = normalizeInstancesData(instancesPayload);
        const keyedInstances = normalizedInstances.map((instance, index) => ({
          ...instance,
          variationKey: buildVariationKey(instance, index),
          displayNumber: index + 1,
          savedRegistrationNumber: instance?.registrationNumber || "",
        }));
        const resolvedCar =
          carPayload?.data?.[0] || carPayload?.car || carPayload || null;
        setCar(resolvedCar);
        const generatedImages = Array.isArray(resolvedCar?.generatedImages)
          ? resolvedCar.generatedImages
          : [];
        const coverGenerated = resolveCoverImage(generatedImages);
        const galleryGenerated = generatedImages.filter(
          (img) => img !== coverGenerated
        );
        const normalizedImages = normalizeImageList(resolvedCar?.images);
        const normalizedGenerated = normalizeImageList(galleryGenerated);
        const defaultImage =
          resolveRemoteImagePath(coverGenerated) ||
          resolveRemoteImagePath(resolvedCar?.coverImage) ||
          resolveRemoteImagePath(resolvedCar?.image) ||
          normalizedImages[0] ||
          normalizedGenerated[0] ||
          "";
        if (defaultImage) {
          setImagePreview((prev) => prev || defaultImage);
        }
        setCoverFallback(defaultImage || "");
        const combinedGallery = [...normalizedImages, ...normalizedGenerated];
        const dedupedGallery = Array.from(new Set(combinedGallery));
        setExistingGalleryImages(
          dedupedGallery.filter((image) => image !== defaultImage)
        );
        setFormValues((prev) => ({
          ...prev,
          vehicleName: resolvedCar?.vehicleName || resolvedCar?.alias || "",
          yearOfManufacture:
            resolvedCar?.yearOfManufacture || resolvedCar?.year || "",
          transmissionType:
            resolvedCar?.transmission || resolvedCar?.transmissionType || "",
          fuelType: resolvedCar?.fuelType || "",
          colorItem: resolvedCar?.colorItem || resolvedCar?.color || "",
          enginePower: resolvedCar?.enginePower || resolvedCar?.power || "",
          engine: resolvedCar?.engine || resolvedCar?.engineCapacity || "",
          engineType:
            resolvedCar?.engineType || resolvedCar?.engineFuelType || "",
          seatsNumber: resolvedCar?.seatsNumber || resolvedCar?.seats || "",
          doorNumber: resolvedCar?.doorNumber || resolvedCar?.doors || "",
          doesHaveAirConditioning:
            resolvedCar?.doesHaveAirConditioning ||
            resolvedCar?.hasAirConditioning ||
            false,
          // description: carPayload?.description || "",
          equipment: resolvedCar?.equipment || {},
        }));
        setInstances(keyedInstances);
        const instanceCoverMap = {};
        const instanceGalleryMap = {};
        const instancePreviewMap = {};
        keyedInstances.forEach((instance) => {
          const { cover, gallery } = buildInstanceImageSet(instance);
          if (cover) {
            instanceCoverMap[instance.variationKey] = cover;
            instancePreviewMap[instance.variationKey] = cover;
          }
          if (gallery.length) {
            instanceGalleryMap[instance.variationKey] = gallery;
          }
        });
        setInstanceExistingCovers(instanceCoverMap);
        setInstanceExistingGalleries(instanceGalleryMap);
        setInstanceCoverPreviews((prev) => ({ ...instancePreviewMap, ...prev }));
        setInstanceEdits(
          keyedInstances.reduce((acc, instance) => {
            acc[instance.variationKey] = {
              ...instance,
              additionalEquipment: { ...instance.additionalEquipment },
            };
            return acc;
          }, {})
        );
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Neuspješno učitavanje podataka.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [carId]);

  useEffect(() => {
    return () => {
      if (imageObjectUrlRef.current) {
        URL.revokeObjectURL(imageObjectUrlRef.current);
        imageObjectUrlRef.current = "";
      }
      if (galleryObjectUrlRef.current.length) {
        galleryObjectUrlRef.current.forEach((url) => URL.revokeObjectURL(url));
        galleryObjectUrlRef.current = [];
      }
      Object.values(instanceCoverUrlsRef.current || {}).forEach((url) =>
        URL.revokeObjectURL(url)
      );
      Object.values(instanceGalleryUrlsRef.current || {}).forEach((urls) => {
        if (Array.isArray(urls)) {
          urls.forEach((url) => URL.revokeObjectURL(url));
        }
      });
      instanceCoverUrlsRef.current = {};
      instanceGalleryUrlsRef.current = {};
    };
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
      imageObjectUrlRef.current = "";
    }
    if (!file) {
      setCoverImageFile(null);
      setImageName("");
      setImagePreview(coverFallback || "");
      return;
    }
    const url = URL.createObjectURL(file);
    imageObjectUrlRef.current = url;
    setImagePreview(url);
    setImageName(file.name);
    setCoverImageFile(file);
  };

  const handleGalleryChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (galleryObjectUrlRef.current.length) {
      galleryObjectUrlRef.current.forEach((url) => URL.revokeObjectURL(url));
      galleryObjectUrlRef.current = [];
    }
    if (!files.length) {
      setGalleryFiles([]);
      setGalleryPreviews([]);
      return;
    }
    const previews = files.map((file) => {
      const url = URL.createObjectURL(file);
      galleryObjectUrlRef.current.push(url);
      return { name: file.name, url };
    });
    setGalleryFiles(files);
    setGalleryPreviews(previews);
  };

  useEffect(() => {
    if (!pendingFocusVariationKey) {
      return;
    }

    const container = variationRefs.current[pendingFocusVariationKey];
    if (!container) {
      return;
    }

    requestAnimationFrame(() => {
      container.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = registrationInputRefs.current[pendingFocusVariationKey];
      if (input && typeof input.focus === "function") {
        input.focus();
      }
    });

    setPendingFocusVariationKey("");
  }, [pendingFocusVariationKey, instances, expandedVariations]);

  const handleInputChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVehicleEquipmentToggle = (key) => {
    setFormValues((prev) => {
      const equipment = { ...(prev.equipment || {}) };
      equipment[key] = !equipment[key];
      return { ...prev, equipment };
    });
  };

  const handleVehicleEquipmentChange = (key, value) => {
    setFormValues((prev) => ({
      ...prev,
      equipment: {
        ...(prev.equipment || {}),
        [key]: value,
      },
    }));
  };

  const handleAddVehicleEquipment = () => {
    const trimmedKey = vehicleEquipmentDraft.key?.trim();
    if (!trimmedKey) {
      return;
    }
    const rawValue = vehicleEquipmentDraft.value;
    const hasTextValue =
      rawValue !== undefined && String(rawValue).trim().length > 0;
    const normalizedValue = hasTextValue
      ? String(rawValue).trim()
      : vehicleEquipmentDraft.isActive ?? true;
    setFormValues((prev) => ({
      ...prev,
      equipment: {
        ...(prev.equipment || {}),
        [trimmedKey]: normalizedValue,
      },
    }));
    setVehicleEquipmentDraft({ key: "", value: "", isActive: true });
  };

  const handleGeneralSave = async () => {
    if (!carId) {
      toast.error("ID vozila nedostaje.");
      return;
    }

    setFieldErrors({});
    setSavingGeneral(true);
    try {
      const payload = {
        vehicleName: formValues.vehicleName,
        yearOfManufacture: formValues.yearOfManufacture,
        transmissionType: formValues.transmissionType,
        fuelType: formValues.fuelType,
        colorItem: formValues.colorItem,
        enginePower: formValues.enginePower,
        engine: formValues.engine,
        engineType: formValues.engineType,
        seatsNumber: formValues.seatsNumber,
        doorNumber: formValues.doorNumber,
        doesHaveAirConditioning: formValues.doesHaveAirConditioning,
        // description: formValues.description,
        equipment: formValues.equipment,
      };
      if (coverImageFile) {
        payload.coverImage = coverImageFile;
      }
      if (galleryFiles.length) {
        payload.images = galleryFiles;
      }
      const response = await adminUpdateCar(carId, payload);
      const successMessage =
        response?.message ||
        response?.successMessage ||
        response?.detail ||
        "Izmjene su sačuvane.";
      toast.success(successMessage);
      setFieldErrors({});
    } catch (err) {
      const validation = err?.validationErrors || {};
      setFieldErrors(validation);
      toast.error("Provjeri unos");
    } finally {
      setSavingGeneral(false);
    }
  };

  const handlePriceRangeInput = (field) => (event) => {
    const value = event.target.value;
    setPriceRange((prev) => {
      const next = { ...prev, [field]: value };
      if (
        field === "startDate" &&
        value &&
        prev.endDate &&
        toDayNumber(value) > toDayNumber(prev.endDate)
      ) {
        next.endDate = "";
      }
      return next;
    });
    if (field === "startDate" && value) {
      const parsed = parseLocalDate(value);
      if (parsed) {
        setCalendarMonth(startOfMonth(parsed));
      }
    }
    setPriceErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCalendarSelect = (iso) => {
    if (!iso) {
      return;
    }
    setPriceErrors((prev) => ({ ...prev, startDate: "", endDate: "" }));
    setPriceRange((prev) => {
      if (!prev.startDate || prev.endDate) {
        return { startDate: iso, endDate: "" };
      }
      const startNum = toDayNumber(prev.startDate);
      const selectedNum = toDayNumber(iso);
      if (!Number.isFinite(startNum) || !Number.isFinite(selectedNum)) {
        return { startDate: iso, endDate: "" };
      }
      if (selectedNum < startNum) {
        return { startDate: iso, endDate: prev.startDate };
      }
      return { ...prev, endDate: iso };
    });
    const parsed = parseLocalDate(iso);
    if (parsed) {
      setCalendarMonth(startOfMonth(parsed));
    }
  };

  const handleResetPriceRange = () => {
    setPriceRange({ startDate: "", endDate: "" });
    setPriceErrors((prev) => ({ ...prev, startDate: "", endDate: "" }));
  };

  const handlePriceTierChange = (index, field, value) => {
    setPriceTiers((prev) =>
      prev.map((tier, idx) =>
        idx === index ? { ...tier, [field]: value } : tier
      )
    );
    setPriceErrors({});
  };

  const handleAddPriceTier = () => {
    setPriceTiers((prev) => {
      const last = prev[prev.length - 1] || {};
      const lastMax = Number(last.maxDays);
      const lastMin = Number(last.minDays);
      const nextMin = Number.isFinite(lastMax)
        ? lastMax + 1
        : Number.isFinite(lastMin)
        ? lastMin + 1
        : 1;
      return [...prev, { minDays: nextMin, maxDays: "", price: "" }];
    });
    setPriceErrors({});
  };

  const handleRemovePriceTier = (index) => {
    setPriceTiers((prev) => prev.filter((_, idx) => idx !== index));
    setPriceErrors({});
  };

  const handlePriceSave = async () => {
    if (!carId) {
      toast.error("ID vozila nedostaje.");
      return;
    }

    const errors = {};
    const { startDate, endDate } = priceRange;
    const startNum = toDayNumber(startDate);
    const endNum = toDayNumber(endDate);

    if (!startDate) {
      errors.startDate = "Odaberite početni datum.";
    }
    if (!endDate) {
      errors.endDate = "Odaberite krajnji datum.";
    }
    if (
      startDate &&
      endDate &&
      Number.isFinite(startNum) &&
      Number.isFinite(endNum) &&
      endNum < startNum
    ) {
      errors.endDate = "Krajnji datum mora biti nakon početnog.";
    }

    if (!priceTiers.length) {
      errors.tiers = "Dodajte makar jedan cjenovni nivo.";
    } else {
      const tierErrors = priceTiers.map((tier) => {
        const entry = {};
        const minDays = Number(tier.minDays);
        const maxDays =
          tier.maxDays === "" || tier.maxDays === null
            ? null
            : Number(tier.maxDays);
        const price = Number(tier.price);

        if (!Number.isFinite(minDays) || minDays < 1) {
          entry.minDays = "Unesite validan minimum.";
        }
        if (maxDays !== null) {
          if (!Number.isFinite(maxDays)) {
            entry.maxDays = "Unesite validan maksimum.";
          } else if (Number.isFinite(minDays) && maxDays < minDays) {
            entry.maxDays = "Maksimum mora biti veći ili jednak minimumu.";
          }
        }
        if (!Number.isFinite(price) || price <= 0) {
          entry.price = "Unesite cijenu.";
        }

        return entry;
      });

      const normalizedForCheck = priceTiers.map((tier, index) => ({
        index,
        minDays: Number(tier.minDays),
        maxDays:
          tier.maxDays === "" || tier.maxDays === null
            ? null
            : Number(tier.maxDays),
      }));

      normalizedForCheck.forEach((current, idx) => {
        const entry = tierErrors[current.index] || {};
        if (current.maxDays === null && idx < normalizedForCheck.length - 1) {
          if (!entry.maxDays) {
            entry.maxDays = "Samo posljednji nivo može biti bez maksimuma.";
          }
        }
        if (idx === 0) {
          tierErrors[current.index] = entry;
          return;
        }
        const previous = normalizedForCheck[idx - 1];
        if (
          Number.isFinite(previous.minDays) &&
          Number.isFinite(current.minDays) &&
          current.minDays <= previous.minDays &&
          !entry.minDays
        ) {
          entry.minDays = "Min dana mora biti veći od prethodnog.";
        }
        if (
          Number.isFinite(previous.maxDays) &&
          Number.isFinite(current.minDays) &&
          current.minDays <= previous.maxDays &&
          !entry.minDays
        ) {
          entry.minDays = "Opseg se preklapa sa prethodnim.";
        }
        if (
          previous.maxDays === null &&
          idx > 0 &&
          !tierErrors[previous.index]?.maxDays
        ) {
          tierErrors[previous.index] = {
            ...tierErrors[previous.index],
            maxDays: "Samo posljednji nivo može biti bez maksimuma.",
          };
        }
        tierErrors[current.index] = entry;
      });

      if (tierErrors.some((entry) => Object.keys(entry).length)) {
        errors.tiers = tierErrors;
      }
    }

    if (Object.keys(errors).length) {
      setPriceErrors(errors);
      toast.error("Provjeri unos.");
      return;
    }

    setPriceSaving(true);
    try {
      const normalizedTiers = priceTiers
        .map((tier) => {
          const result = {
            minDays: Number(tier.minDays),
            price: Number(tier.price),
          };
          const rawMax = tier.maxDays;
          if (rawMax !== "" && rawMax !== null && rawMax !== undefined) {
            result.maxDays = Number(rawMax);
          }
          return result;
        })
        .sort((a, b) => a.minDays - b.minDays);
      const numericCarId = Number(carId);
      const payload = {
        carId: Number.isFinite(numericCarId) ? numericCarId : carId,
        startingDate: startDate,
        endingDate: endDate,
        tiers: normalizedTiers,
      };
      const response = await adminCreateCarPrices(payload);
      const message =
        response?.message ||
        response?.successMessage ||
        response?.detail ||
        "Cijene su sačuvane.";
      toast.success(message);
      setPriceErrors({});
      setPriceRange({ startDate: "", endDate: "" });
      setPriceTiers([{ minDays: 1, maxDays: "", price: "" }]);
      await loadPricePeriods();
    } catch (err) {
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
      toast.error(err?.message || "Greška pri kreiranju cijena.");
    } finally {
      setPriceSaving(false);
    }
  };

  const buildPriceEditDraft = (period) => {
    const tiers = Array.isArray(period?.tiers) ? period.tiers : [];
    return {
      id: period?.id,
      startDate: period?.startingDate || "",
      endDate: period?.endingDate || "",
      tiers: tiers.length
        ? tiers.map((tier) => ({
            id: tier?.id,
            minDays: tier?.minDays ?? "",
            maxDays: tier?.maxDays ?? "",
            price: tier?.price ?? "",
          }))
        : [{ minDays: 1, maxDays: "", price: "" }],
    };
  };

  const ensurePriceEditDraft = (period) => {
    if (!period?.id) {
      return;
    }
    setPriceEditDrafts((prev) => {
      if (prev[period.id]) {
        return prev;
      }
      return { ...prev, [period.id]: buildPriceEditDraft(period) };
    });
  };

  const handlePriceEditStart = (period) => {
    if (!period?.id) {
      return;
    }
    ensurePriceEditDraft(period);
    setPriceEditingId(period.id);
  };

  const handlePriceEditCancel = () => {
    setPriceEditingId(null);
  };

  const handlePriceEditFieldChange = (periodId, field, value) => {
    setPriceEditDrafts((prev) => ({
      ...prev,
      [periodId]: {
        ...prev[periodId],
        [field]: value,
      },
    }));
    setPriceEditErrors((prev) => {
      const next = { ...prev };
      if (next[periodId]) {
        next[periodId] = { ...next[periodId], [field]: "" };
      }
      return next;
    });
  };

  const handlePriceEditTierChange = (periodId, index, field, value) => {
    setPriceEditDrafts((prev) => {
      const current = prev[periodId];
      if (!current) {
        return prev;
      }
      const tiers = current.tiers.map((tier, idx) =>
        idx === index ? { ...tier, [field]: value } : tier
      );
      return {
        ...prev,
        [periodId]: { ...current, tiers },
      };
    });
    setPriceEditErrors((prev) => {
      const next = { ...prev };
      if (next[periodId]) {
        next[periodId] = { ...next[periodId], tiers: [] };
      }
      return next;
    });
  };

  const handlePriceEditAddTier = (periodId) => {
    setPriceEditDrafts((prev) => {
      const current = prev[periodId];
      if (!current) {
        return prev;
      }
      const last = current.tiers[current.tiers.length - 1] || {};
      const lastMax = Number(last.maxDays);
      const lastMin = Number(last.minDays);
      const nextMin = Number.isFinite(lastMax)
        ? lastMax + 1
        : Number.isFinite(lastMin)
        ? lastMin + 1
        : 1;
      return {
        ...prev,
        [periodId]: {
          ...current,
          tiers: [...current.tiers, { minDays: nextMin, maxDays: "", price: "" }],
        },
      };
    });
  };

  const handlePriceEditRemoveTier = (periodId, index) => {
    setPriceEditDrafts((prev) => {
      const current = prev[periodId];
      if (!current) {
        return prev;
      }
      const tiers = current.tiers.filter((_, idx) => idx !== index);
      return {
        ...prev,
        [periodId]: {
          ...current,
          tiers: tiers.length ? tiers : [{ minDays: 1, maxDays: "", price: "" }],
        },
      };
    });
  };

  const validatePriceDraft = (draft) => {
    const errors = {};
    if (!draft?.startDate) {
      errors.startDate = "Odaberite početni datum.";
    }
    if (!draft?.endDate) {
      errors.endDate = "Odaberite krajnji datum.";
    }
    const startNum = toDayNumber(draft?.startDate);
    const endNum = toDayNumber(draft?.endDate);
    if (
      draft?.startDate &&
      draft?.endDate &&
      Number.isFinite(startNum) &&
      Number.isFinite(endNum) &&
      endNum < startNum
    ) {
      errors.endDate = "Krajnji datum mora biti nakon početnog.";
    }
    const tiers = Array.isArray(draft?.tiers) ? draft.tiers : [];
    if (!tiers.length) {
      errors.tiers = "Dodajte makar jedan cjenovni nivo.";
    } else {
      const tierErrors = tiers.map((tier) => {
        const entry = {};
        const minDays = Number(tier.minDays);
        const maxDays =
          tier.maxDays === "" || tier.maxDays === null
            ? null
            : Number(tier.maxDays);
        const price = Number(tier.price);

        if (!Number.isFinite(minDays) || minDays < 1) {
          entry.minDays = "Unesite validan minimum.";
        }
        if (maxDays !== null) {
          if (!Number.isFinite(maxDays)) {
            entry.maxDays = "Unesite validan maksimum.";
          } else if (Number.isFinite(minDays) && maxDays < minDays) {
            entry.maxDays = "Maksimum mora biti veći ili jednak minimumu.";
          }
        }
        if (!Number.isFinite(price) || price <= 0) {
          entry.price = "Unesite cijenu.";
        }
        return entry;
      });
      const normalizedForCheck = tiers.map((tier, index) => ({
        index,
        minDays: Number(tier.minDays),
        maxDays:
          tier.maxDays === "" || tier.maxDays === null
            ? null
            : Number(tier.maxDays),
      }));
      normalizedForCheck.forEach((current, idx) => {
        const entry = tierErrors[current.index] || {};
        if (current.maxDays === null && idx < normalizedForCheck.length - 1) {
          if (!entry.maxDays) {
            entry.maxDays = "Samo posljednji nivo može biti bez maksimuma.";
          }
        }
        if (idx === 0) {
          tierErrors[current.index] = entry;
          return;
        }
        const previous = normalizedForCheck[idx - 1];
        if (
          Number.isFinite(previous.minDays) &&
          Number.isFinite(current.minDays) &&
          current.minDays <= previous.minDays &&
          !entry.minDays
        ) {
          entry.minDays = "Min dana mora biti veći od prethodnog.";
        }
        if (
          Number.isFinite(previous.maxDays) &&
          Number.isFinite(current.minDays) &&
          current.minDays <= previous.maxDays &&
          !entry.minDays
        ) {
          entry.minDays = "Opseg se preklapa sa prethodnim.";
        }
        if (
          previous.maxDays === null &&
          idx > 0 &&
          !tierErrors[previous.index]?.maxDays
        ) {
          tierErrors[previous.index] = {
            ...tierErrors[previous.index],
            maxDays: "Samo posljednji nivo može biti bez maksimuma.",
          };
        }
        tierErrors[current.index] = entry;
      });
      if (tierErrors.some((entry) => Object.keys(entry).length)) {
        errors.tiers = tierErrors;
      }
    }
    return errors;
  };

  const handlePriceEditSave = async (periodId) => {
    const draft = priceEditDrafts[periodId];
    if (!draft) {
      return;
    }
    const errors = validatePriceDraft(draft);
    if (Object.keys(errors).length) {
      setPriceEditErrors((prev) => ({ ...prev, [periodId]: errors }));
      toast.error("Provjeri unos.");
      return;
    }
    setPriceEditSaving((prev) => ({ ...prev, [periodId]: true }));
    try {
      const normalizedTiers = draft.tiers
        .map((tier) => {
          const result = {
            minDays: Number(tier.minDays),
            price: Number(tier.price),
          };
          const rawMax = tier.maxDays;
          if (rawMax !== "" && rawMax !== null && rawMax !== undefined) {
            result.maxDays = Number(rawMax);
          }
          return result;
        })
        .sort((a, b) => a.minDays - b.minDays);
      const numericCarId = Number(carId);
      await adminUpdateCarPrice(periodId, {
        carId: Number.isFinite(numericCarId) ? numericCarId : carId,
        startingDate: draft.startDate,
        endingDate: draft.endDate,
        tiers: normalizedTiers,
      });
      toast.success("Cijene su ažurirane.");
      setPriceEditingId(null);
      await loadPricePeriods();
    } catch (err) {
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
      toast.error(err?.message || "Greška pri ažuriranju cijena.");
    } finally {
      setPriceEditSaving((prev) => ({ ...prev, [periodId]: false }));
    }
  };

  const handlePriceDelete = async (periodId) => {
    if (!periodId || priceDeleteLoading[periodId]) {
      return;
    }
    const confirmed =
      typeof window !== "undefined"
        ? window.confirm("Da li ste sigurni da želite da obrišete ovaj period?")
        : false;
    if (!confirmed) {
      return;
    }
    setPriceDeleteLoading((prev) => ({ ...prev, [periodId]: true }));
    try {
      await adminDeleteCarPrice(periodId);
      toast.success("Period je obrisan.");
      if (priceEditingId === periodId) {
        setPriceEditingId(null);
      }
      await loadPricePeriods();
    } catch (err) {
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
      toast.error(err?.message || "Greška pri brisanju cijena.");
    } finally {
      setPriceDeleteLoading((prev) => ({ ...prev, [periodId]: false }));
    }
  };

  const loadPricePeriods = async ({ signal } = {}) => {
    if (!carId) {
      return;
    }
    setPriceLoading(true);
    setPriceLoadError("");
    try {
      const payload = await adminGetCarPrices(carId, { signal });
      const rawItems = payload?.data || payload?.items || payload?.prices || [];
      const items = Array.isArray(rawItems) ? rawItems : [];
      const normalized = items
        .map((item) => ({
          id: item?.id,
          carId: item?.carId,
          startingDate: normalizeRemoteDate(item?.startingDate),
          endingDate: normalizeRemoteDate(item?.endingDate),
          tiers: Array.isArray(item?.tiers) ? item.tiers : [],
        }))
        .filter((item) => item.startingDate && item.endingDate)
        .sort(
          (a, b) =>
            toDayNumber(a.startingDate) - toDayNumber(b.startingDate)
        );
      setPricePeriods(normalized);
      setPriceMeta(payload?.meta || null);
    } catch (err) {
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
      setPriceLoadError(err?.message || "Neuspješno učitavanje cijena.");
    } finally {
      setPriceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "prices") {
      return;
    }
    const controller = new AbortController();
    loadPricePeriods({ signal: controller.signal });
    return () => controller.abort();
  }, [activeTab, carId]);

  const toggleVariation = (variationKey) => {
    setExpandedVariations((prev) => ({
      ...prev,
      [variationKey]: !prev[variationKey],
    }));
  };

  const removeVariationFromState = (variationKey) => {
    setInstances((prev) =>
      prev.filter((instance) => instance.variationKey !== variationKey)
    );
    setInstanceEdits((prev) => {
      const next = { ...prev };
      delete next[variationKey];
      return next;
    });
    setInstanceCoverFiles((prev) => {
      const next = { ...prev };
      delete next[variationKey];
      return next;
    });
    setInstanceCoverPreviews((prev) => {
      const next = { ...prev };
      delete next[variationKey];
      return next;
    });
    setInstanceGalleryFiles((prev) => {
      const next = { ...prev };
      delete next[variationKey];
      return next;
    });
    setInstanceGalleryPreviews((prev) => {
      const next = { ...prev };
      delete next[variationKey];
      return next;
    });
    setInstanceExistingCovers((prev) => {
      const next = { ...prev };
      delete next[variationKey];
      return next;
    });
    setInstanceExistingGalleries((prev) => {
      const next = { ...prev };
      delete next[variationKey];
      return next;
    });
    setExpandedVariations((prev) => {
      const next = { ...prev };
      delete next[variationKey];
      return next;
    });
    const coverUrl = instanceCoverUrlsRef.current[variationKey];
    if (coverUrl) {
      URL.revokeObjectURL(coverUrl);
      delete instanceCoverUrlsRef.current[variationKey];
    }
    const galleryUrls = instanceGalleryUrlsRef.current[variationKey];
    if (Array.isArray(galleryUrls)) {
      galleryUrls.forEach((url) => URL.revokeObjectURL(url));
      delete instanceGalleryUrlsRef.current[variationKey];
    }
  };

  const confirmVariationDelete = (registrationNumber) =>
    new Promise((resolve) => {
      const messageSuffix = registrationNumber
        ? ` (${registrationNumber})`
        : "";
      toast.custom(
        (t) => (
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              border: "1px solid rgba(0,0,0,0.08)",
              maxWidth: "320px",
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>Potvrda brisanja</p>
            <p
              style={{
                margin: "8px 0 14px",
                fontSize: "14px",
                lineHeight: 1.4,
              }}
            >
              Da li ste sigurni da želite da obrišete ovu varijaciju
              {messageSuffix}?
            </p>
            <div
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                Otkaži
              </button>
              <button
                type="button"
                className="link-button danger"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Obriši
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

  const handleVariationDelete = async (variationKey, registrationNumber) => {
    if (instanceDeleting[variationKey]) {
      return;
    }
    const confirmed = await confirmVariationDelete(registrationNumber);
    if (!confirmed) {
      return;
    }
    if (registrationNumber) {
      setInstanceDeleting((prev) => ({
        ...prev,
        [variationKey]: true,
      }));
      try {
        await adminDeleteCarInstance(registrationNumber);
        toast.success("Varijacija je obrisana.");
      } catch (err) {
        toast.error(err?.message || "Greška pri brisanju varijacije.");
        setInstanceDeleting((prev) => {
          const next = { ...prev };
          delete next[variationKey];
          return next;
        });
        return;
      }
    }
    removeVariationFromState(variationKey);
    setInstanceDeleting((prev) => {
      const next = { ...prev };
      delete next[variationKey];
      return next;
    });
  };

  const handleInstanceFieldChange = (variationKey, field, value) => {
    setInstanceEdits((prev) => ({
      ...prev,
      [variationKey]: {
        ...prev[variationKey],
        [field]: value,
      },
    }));
  };

  const handleInstanceToggle = (variationKey, key) => {
    const existing = instanceEdits[variationKey] || {};
    const equipment = {
      ...existing.additionalEquipment,
      [key]: !existing.additionalEquipment?.[key],
    };
    setInstanceEdits((prev) => ({
      ...prev,
      [variationKey]: {
        ...existing,
        additionalEquipment: equipment,
      },
    }));
  };

  const handleEquipmentChange = (variationKey, key, value) => {
    const existing = instanceEdits[variationKey] || {};
    const equipment = {
      ...existing.additionalEquipment,
      [key]: value,
    };
    setInstanceEdits((prev) => ({
      ...prev,
      [variationKey]: {
        ...existing,
        additionalEquipment: equipment,
      },
    }));
  };

  const handleAddEquipment = (variationKey) => {
    const entry = newEquipment[variationKey] || {};
    const trimmedKey = entry.key?.trim();
    if (!trimmedKey) {
      return;
    }
    const rawValue = entry.value;
    const hasTextValue =
      rawValue !== undefined && String(rawValue).trim().length > 0;
    const normalizedValue = hasTextValue
      ? String(rawValue).trim()
      : entry.isActive ?? true;
    handleEquipmentChange(variationKey, trimmedKey, normalizedValue);
    setNewEquipment((prev) => ({
      ...prev,
      [variationKey]: { key: "", value: "", isActive: true },
    }));
  };

  const handleVariationSave = async (variationKey) => {
    const edit = instanceEdits[variationKey];
    if (!edit) {
      return;
    }
    setFieldErrors({});
    setInstanceSaving((prev) => ({ ...prev, [variationKey]: true }));
    try {
      if (!edit.registrationNumber) {
        setFieldErrors({
          registrationNumber:
            "Registracija je obavezna pre nego što možete sačuvati varijaciju.",
        });
        return;
      }
      if (edit.isNewInstance) {
        if (!carId) {
          throw new Error("ID vozila nedostaje.");
        }
        const numericCarId = Number(carId);
        const created = await adminCreateCarInstance({
          carId: Number.isFinite(numericCarId) ? numericCarId : carId,
          registrationNumber: edit.registrationNumber,
          additionalEquipment: edit.additionalEquipment,
          coverImage: instanceCoverFiles[variationKey],
          images: instanceGalleryFiles[variationKey],
        });
        const normalized = normalizeInstancesData(created)[0] ?? created;
        const merged = {
          ...normalized,
          variationKey,
          displayNumber: edit.displayNumber,
          savedRegistrationNumber: edit.registrationNumber,
          additionalEquipment: {
            ...(normalized.additionalEquipment || edit.additionalEquipment),
          },
          isNewInstance: false,
        };
        setInstances((prev) =>
          prev.map((instance) =>
            instance.variationKey === variationKey ? merged : instance
          )
        );
        setInstanceEdits((prev) => ({
          ...prev,
          [variationKey]: merged,
        }));
        toast.success("Nova varijacija je dodata.");
      } else {
        const urlRegistrationNumber =
          edit.savedRegistrationNumber || edit.registrationNumber;
        await adminUpdateCarInstance(urlRegistrationNumber, {
          carId,
          registrationNumber: edit.registrationNumber,
          enginePower: edit.enginePower,
          engineCapacity: edit.engineCapacity,
          engineType: edit.engineType,
          transmission: edit.transmission,
          fuelType: edit.fuelType,
          price: edit.price,
          status: edit.status,
          additionalEquipment: edit.additionalEquipment,
          coverImage: instanceCoverFiles[variationKey],
          images: instanceGalleryFiles[variationKey],
        });
        if (edit.savedRegistrationNumber !== edit.registrationNumber) {
          setInstanceEdits((prev) => ({
            ...prev,
            [variationKey]: {
              ...prev[variationKey],
              savedRegistrationNumber: edit.registrationNumber,
            },
          }));
          setInstances((prev) =>
            prev.map((instance) =>
              instance.variationKey === variationKey
                ? { ...instance, savedRegistrationNumber: edit.registrationNumber }
                : instance
            )
          );
        }
        toast.success("Varijacija je sačuvana.");
      }
    } catch (err) {
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
      const validation = err?.validationErrors || {};
      if (Object.keys(validation).length) {
        setFieldErrors(validation);
        toast.error("Provjeri unos");
        return;
      }
      toast.error(err?.message || "Greška pri čuvanju varijacije.");
    } finally {
      setInstanceSaving((prev) => ({ ...prev, [variationKey]: false }));
    }
  };

  const handleAddVariation = () => {
    const variationKey = `new-${Date.now()}`;
    const displayNumber = getNextVariationNumber(instances);
    const blankVariation = {
      variationKey,
      displayNumber,
      savedRegistrationNumber: "",
      registrationNumber: "",
      enginePower: "",
      engineCapacity: "",
      engineType: "",
      fuelType: "",
      transmission: "",
      price: "",
      status: "draft",
      additionalEquipment: {},
      isNewInstance: true,
    };
    setInstances((prev) => [...prev, blankVariation]);
    setInstanceEdits((prev) => ({
      ...prev,
      [variationKey]: blankVariation,
    }));
    setExpandedVariations((prev) => ({
      ...prev,
      [variationKey]: true,
    }));
    setPendingFocusVariationKey(variationKey);
  };

  const handleInstanceCoverChange = (variationKey, event) => {
    const file = event.target.files?.[0];
    const existingUrl = instanceCoverUrlsRef.current[variationKey];
    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
      delete instanceCoverUrlsRef.current[variationKey];
    }
    if (!file) {
      setInstanceCoverFiles((prev) => ({ ...prev, [variationKey]: null }));
      setInstanceCoverPreviews((prev) => ({ ...prev, [variationKey]: "" }));
      return;
    }
    const url = URL.createObjectURL(file);
    instanceCoverUrlsRef.current[variationKey] = url;
    setInstanceCoverFiles((prev) => ({ ...prev, [variationKey]: file }));
    setInstanceCoverPreviews((prev) => ({ ...prev, [variationKey]: url }));
  };

  const handleInstanceGalleryChange = (variationKey, event) => {
    const files = Array.from(event.target.files || []);
    const existingUrls = instanceGalleryUrlsRef.current[variationKey];
    if (Array.isArray(existingUrls)) {
      existingUrls.forEach((url) => URL.revokeObjectURL(url));
    }
    if (!files.length) {
      setInstanceGalleryFiles((prev) => ({ ...prev, [variationKey]: [] }));
      setInstanceGalleryPreviews((prev) => ({ ...prev, [variationKey]: [] }));
      instanceGalleryUrlsRef.current[variationKey] = [];
      return;
    }
    const previews = files.map((file) => {
      const url = URL.createObjectURL(file);
      return { name: file.name, url };
    });
    instanceGalleryUrlsRef.current[variationKey] = previews.map((p) => p.url);
    setInstanceGalleryFiles((prev) => ({ ...prev, [variationKey]: files }));
    setInstanceGalleryPreviews((prev) => ({
      ...prev,
      [variationKey]: previews,
    }));
  };

  if (loading) {
    return <div className="alert-message">Učitavanje...</div>;
  }
  if (error) {
    return <div className="alert-message error">{error}</div>;
  }
  if (!car) {
    return <div className="alert-message">Vozilo nije pronađeno.</div>;
  }

  const calendarData = buildCalendarDays(calendarMonth);
  const rangeDays = calculateRangeDays(
    priceRange.startDate,
    priceRange.endDate
  );
  const priceTierErrors = Array.isArray(priceErrors.tiers)
    ? priceErrors.tiers
    : [];
  const selectedStart = toDayNumber(priceRange.startDate);
  const selectedEnd = toDayNumber(priceRange.endDate);
  const overlappingPeriods =
    Number.isFinite(selectedStart) && Number.isFinite(selectedEnd)
      ? pricePeriods.filter((period) => {
          const periodStart = toDayNumber(period.startingDate);
          const periodEnd = toDayNumber(period.endingDate);
          if (!Number.isFinite(periodStart) || !Number.isFinite(periodEnd)) {
            return false;
          }
          return periodStart <= selectedEnd && periodEnd >= selectedStart;
        })
      : [];
  const pricePeriodRanges = pricePeriods
    .map((period) => {
      const start = toDayNumber(period.startingDate);
      const end = toDayNumber(period.endingDate);
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return null;
      }
      return {
        id: period.id,
        start,
        end,
        label: `${formatDisplayDate(period.startingDate)} - ${formatDisplayDate(
          period.endingDate
        )}`,
      };
    })
    .filter(Boolean);

  const getExistingCount = (iso) => {
    if (!iso) {
      return 0;
    }
    const dayNumber = toDayNumber(iso);
    if (!Number.isFinite(dayNumber)) {
      return 0;
    }
    return pricePeriodRanges.reduce((count, range) => {
      if (dayNumber >= range.start && dayNumber <= range.end) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const getExistingTitles = (iso) => {
    if (!iso) {
      return "";
    }
    const dayNumber = toDayNumber(iso);
    if (!Number.isFinite(dayNumber)) {
      return "";
    }
    const matches = pricePeriodRanges.filter(
      (range) => dayNumber >= range.start && dayNumber <= range.end
    );
    if (!matches.length) {
      return "";
    }
    const labels = matches.slice(0, 2).map((range) => range.label);
    const suffix =
      matches.length > 2 ? ` (+${matches.length - 2} više)` : "";
    return `Cjenovni periodi: ${labels.join(", ")}${suffix}`;
  };

  return (
    <div className="car-details-tabs">
      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === "general" ? "active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          Podaci o vozilu
        </button>
        <button
          type="button"
          className={`tab ${activeTab === "variations" ? "active" : ""}`}
          onClick={() => setActiveTab("variations")}
        >
          Varijacije
        </button>
        <button
          type="button"
          className={`tab ${activeTab === "prices" ? "active" : ""}`}
          onClick={() => setActiveTab("prices")}
        >
          Cijene
        </button>
      </div>
      <div className="tab-panel">
        {activeTab === "general" ? (
          <form className="vehicle-detail-form">
            <div className="form-section general-section">
              <div className="section-heading">
                <div> 
                  <h3>Osnovne informacije</h3>
                </div>
              </div>
              <div className="image-upload">
                <label className="image-upload-label">
                  <span>Slika vozila</span>
                  <div className="image-upload-control">
                    <div
                      className={`image-preview ${
                        imagePreview ? "has-image" : ""
                      }`}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} alt="Slika vozila" />
                      ) : (
                        <span>Dodaj sliku</span>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  {imageName && (
                    <p className="image-filename">{imageName}</p>
                  )}
                  {fieldErrors.coverImage && (
                    <p className="field-error-text">{fieldErrors.coverImage}</p>
                  )}
                </label>
              </div>
              <div className="image-upload">
                <label className="image-upload-label">
                  <span>Galerija (dodatne slike)</span>
                  <div className="image-upload-control">
                    {galleryPreviews.length ? (
                      galleryPreviews.map((preview) => (
                        <div className="image-preview has-image" key={preview.url}>
                          <img src={preview.url} alt={preview.name} />
                        </div>
                      ))
                    ) : (
                      <div className="image-preview">
                        <span>Dodaj slike</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleGalleryChange}
                    />
                  </div>
                  {galleryFiles.length > 0 && (
                    <p className="image-filename">
                      Odabrano: {galleryFiles.length}
                    </p>
                  )}
                  {fieldErrors.images && (
                    <p className="field-error-text">{fieldErrors.images}</p>
                  )}
                </label>
                {existingGalleryImages.length > 0 && (
                  <div className="existing-images">
                    <p className="image-filename">Postojeće slike:</p>
                    <div className="image-preview-grid">
                      {existingGalleryImages.map((image, index) => (
                        <div
                          className="image-preview has-image"
                          key={`${image}-${index}`}
                        >
                          <img src={image} alt={`Postojeća slika ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="field-grid two-columns">
                {[
                  {
                    label: "Naziv",
                    field: "vehicleName",
                    type: "text",
                  },
                  {
                    label: "Godina proizvodnje",
                    field: "yearOfManufacture",
                    type: "number",
                    min: 1900,
                    max: new Date().getFullYear(),
                  },
                  {
                    label: "Menjač",
                    field: "transmissionType",
                    type: "select",
                    options: TRANSMISSION_OPTIONS,
                  },
                  {
                    label: "Boja",
                    field: "colorItem",
                    type: "text",
                  },
                  {
                    label: "Tip motora",
                    field: "engineType",
                    type: "select",
                    options: ENGINE_TYPE_OPTIONS,
                  },
                  {
                    label: "Gorivo",
                    field: "fuelType",
                    type: "select",
                    options: FUEL_TYPE_OPTIONS,
                  },
                ].map((item) => {
                  const invalid = fieldErrors[item.field];
                  const sharedProps = {
                    value: formValues[item.field],
                    onChange: handleInputChange(item.field),
                    className: invalid ? "input-invalid" : "",
                  };
                  return (
                    <label key={item.field}>
                      <span>{item.label}</span>
                      {item.type === "select" && item.options ? (
                        <select {...sharedProps}>
                          {item.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={item.type}
                          min={item.min}
                          max={item.max}
                          {...sharedProps}
                        />
                      )}
                      {invalid && (
                        <p className="field-error-text">{invalid}</p>
                      )}
                    </label>
                  );
                })}
                
              </div>
              <div className="field-grid three-columns">
                {[
                  {
                    label: "Snaga motora (hp)",
                    field: "enginePower",
                    type: "number",
                  },
                  {
                    label: "Zapremina motora (cc)",
                    field: "engine",
                    type: "number",
                  },
                  {
                    label: "Broj sjedišta",
                    field: "seatsNumber",
                    type: "number",
                  },
                  {
                    label: "Broj vrata",
                    field: "doorNumber",
                    type: "number",
                  },
                ].map((item) => {
                  const invalid = fieldErrors[item.field];
                  return (
                    <label key={item.field}>
                      <span>{item.label}</span>
                      <input
                        type={item.type}
                        min={item.min}
                        max={item.max}
                        value={formValues[item.field]}
                        onChange={handleInputChange(item.field)}
                        className={invalid ? "input-invalid" : ""}
                      />
                      {invalid && (
                        <p className="field-error-text">{invalid}</p>
                      )}
                    </label>
                  );
                })}
                
              </div>
              <div>
                <label>
                  <span>Klima</span>
                  <input
                    type="checkbox"
                    checked={Boolean(formValues.doesHaveAirConditioning)}
                    onChange={handleInputChange("doesHaveAirConditioning")}
                  />
                </label>
              </div>
              {(() => {
                const equipmentEntries = Object.entries(formValues.equipment || {});
                const draftValue = vehicleEquipmentDraft.value ?? "";
                const draftHasText = String(draftValue).trim().length > 0;
                const draftIsActive = vehicleEquipmentDraft.isActive ?? true;
                return (
                  <div className="vehicle-equipment">
                    <p className="variation-section-title">Dodatna oprema</p>
                    <div className="equipment-grid">
                      {equipmentEntries.length ? (
                        equipmentEntries.map(([key, value]) => {
                          const isTextValue =
                            typeof value === "string" || typeof value === "number";
                          if (isTextValue) {
                            return (
                              <label key={key} className="equipment-input">
                                <span>{key}</span>
                                <input
                                  type="text"
                                  value={value ?? ""}
                                  onChange={(event) =>
                                    handleVehicleEquipmentChange(
                                      key,
                                      event.target.value
                                    )
                                  }
                                />
                              </label>
                            );
                          }
                          return (
                            <label key={key} className="equipment-toggle">
                              <input
                                type="checkbox"
                                checked={Boolean(value)}
                                onChange={() => handleVehicleEquipmentToggle(key)}
                              />
                              <span>{key}</span>
                            </label>
                          );
                        })
                      ) : (
                        <p className="secondary">Bez dodatne opreme</p>
                      )}
                    </div>
                    <div className="add-equipment">
                      <input
                        type="text"
                        placeholder="Naziv opreme"
                        value={vehicleEquipmentDraft.key || ""}
                        onChange={(event) =>
                          setVehicleEquipmentDraft((prev) => ({
                            ...prev,
                            key: event.target.value,
                          }))
                        }
                      />
                      <input
                        type="text"
                        placeholder="Vrijednost (opciono)"
                        value={draftValue}
                        onChange={(event) =>
                          setVehicleEquipmentDraft((prev) => ({
                            ...prev,
                            value: event.target.value,
                          }))
                        }
                      />
                      <label className="equipment-flag">
                        <input
                          type="checkbox"
                          checked={draftIsActive}
                          disabled={draftHasText}
                          aria-label="Aktivno"
                          onChange={(event) =>
                            setVehicleEquipmentDraft((prev) => ({
                              ...prev,
                              isActive: event.target.checked,
                            }))
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="ghost-action"
                        onClick={handleAddVehicleEquipment}
                      >
                        Dodaj opremu
                      </button>
                    </div>
                  </div>
                );
              })()}
              {/* <label className="full">
                <span>Description</span>
                <textarea
                  rows={4}
                  value={formValues.description || ""}
                  onChange={handleInputChange("description")}
                />
                {fieldErrors.description && (
                  <p className="field-error-text">{fieldErrors.description}</p>
                )}
              </label> */}
              <div className="form-actions">
                <button
                  type="button"
                  className="primary-action"
                  onClick={handleGeneralSave}
                  disabled={savingGeneral}
                >
                  {savingGeneral ? "Sačuvaj..." : "Sačuvaj izmjene"}
                </button>
              </div>
            </div>
          </form>
        ) : activeTab === "variations" ? (
          <div className="form-section variations-section">
            <div className="section-heading">
              <div> 
                <h3>Upravljanje varijacijama</h3>
              </div>
              <button
                type="button"
                className="primary-action"
                onClick={handleAddVariation}
              >
                + Dodaj varijaciju
              </button>
            </div>
            <div className="variation-accordion">
              {instances.length ? (
                instances.map((instance, index) => {
                  const variationKey = instance.variationKey;
                  const edit = instanceEdits[variationKey] || instance;
                  const expanded = Boolean(expandedVariations[variationKey]);
                  const variationNumber =
                    edit.displayNumber ?? instance.displayNumber ?? index + 1;
                  const variationLabelSuffix = edit.registrationNumber
                    ? edit.registrationNumber
                    : "Nova";
                  const headerInfo = formatEngineLabel(
                    edit.enginePower,
                    edit.engineCapacity,
                    edit.engineType
                  );
                  const equipmentEntries = Object.entries(
                    edit.additionalEquipment || {}
                  );
                  const newEntry = newEquipment[variationKey] || {};
                  const newValue = newEntry.value ?? "";
                  const hasTextValue =
                    String(newValue).trim().length > 0;
                  const newIsActive = newEntry.isActive ?? true;
                  const variationCoverPreview =
                    instanceCoverPreviews[variationKey] ||
                    instanceExistingCovers[variationKey] ||
                    "";
                  const variationCoverName =
                    instanceCoverFiles[variationKey]?.name || "";
                  const variationGalleryPreviews =
                    instanceGalleryPreviews[variationKey] || [];
                  const variationGalleryFiles =
                    instanceGalleryFiles[variationKey] || [];
                  const existingGallery =
                    instanceExistingGalleries[variationKey] || [];
                  const variationThumb =
                    variationCoverPreview || existingGallery[0] || "";

                  return (
                    <div
                      key={variationKey}
                      ref={(node) => {
                        if (node) {
                          variationRefs.current[variationKey] = node;
                        }
                      }}
                      className={`variation-card ${expanded ? "expanded" : ""}`}
                    >
                      <div className="variation-header">
                        <div className="variation-title">
                          <span
                            className={`variation-thumb ${
                              variationThumb ? "has-image" : ""
                            }`}
                            style={
                              variationThumb
                                ? { backgroundImage: `url(${variationThumb})` }
                                : undefined
                            }
                            aria-hidden="true"
                          />
                          <p className="variation-label">
                            Varijacija #{variationNumber} · {variationLabelSuffix}
                          </p> 
                        </div>
                        <div className="variation-header-controls"> 
                          <button
                            type="button"
                            className="link-button"
                            onClick={() => toggleVariation(variationKey)}
                          >
                            {expanded ? "Sakrij" : "Uredi"}
                            <span
                              className={`chevron ${expanded ? "open" : ""}`}
                            />
                          </button>
                              <button
                                type="button"
                                className="link-button danger"
                                onClick={() =>
                                  handleVariationDelete(
                                    variationKey,
                                    edit.savedRegistrationNumber ||
                                      edit.registrationNumber
                                  )
                                }
                                disabled={Boolean(instanceDeleting[variationKey])}
                              >
                        {instanceDeleting[variationKey]
                          ? "Brišem..."
                          : "Obriši"}
                      </button>
                        </div>
                      </div>
                      {expanded && (
                        <div className="variation-body">
                          <div className="field-grid two-columns">
                            <div className="image-upload">
                              <label className="image-upload-label">
                                <span>Cover slika varijacije</span>
                                <div className="image-upload-control">
                                  <div
                                    className={`image-preview ${
                                      variationCoverPreview ? "has-image" : ""
                                    }`}
                                  >
                                    {variationCoverPreview ? (
                                      <img
                                        src={variationCoverPreview}
                                        alt="Cover slika varijacije"
                                      />
                                    ) : (
                                      <span>Dodaj sliku</span>
                                    )}
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                      handleInstanceCoverChange(
                                        variationKey,
                                        event
                                      )
                                    }
                                  />
                                </div>
                                {variationCoverName && (
                                  <p className="image-filename">
                                    {variationCoverName}
                                  </p>
                                )}
                              </label>
                            </div>
                            <label className="variation-registration">
                              <span>Registracija</span>
                              <input
                                type="text"
                                name="registrationNumber"
                                ref={(node) => {
                                  if (node) {
                                    registrationInputRefs.current[variationKey] =
                                      node;
                                  }
                                }}
                                value={edit.registrationNumber || ""}
                                onChange={(event) =>
                                  handleInstanceFieldChange(
                                    variationKey,
                                    "registrationNumber",
                                    event.target.value
                                  )
                                }
                                className={
                                  fieldErrors.registrationNumber
                                    ? "input-invalid"
                                    : ""
                                }
                              />
                              {fieldErrors.registrationNumber && (
                                <p className="field-error-text">
                                  {fieldErrors.registrationNumber}
                                </p>
                              )}
                            </label>
                          </div>
                          <div className="image-upload">
                            <label className="image-upload-label">
                              <span>Galerija (dodatne slike)</span>
                              <div className="image-upload-control">
                                {variationGalleryPreviews.length ? (
                                  variationGalleryPreviews.map((preview) => (
                                    <div
                                      className="image-preview has-image"
                                      key={preview.url}
                                    >
                                      <img
                                        src={preview.url}
                                        alt={preview.name}
                                      />
                                    </div>
                                  ))
                                ) : (
                                  <div className="image-preview">
                                    <span>Dodaj slike</span>
                                  </div>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(event) =>
                                    handleInstanceGalleryChange(
                                      variationKey,
                                      event
                                    )
                                  }
                                />
                              </div>
                              {variationGalleryFiles.length > 0 && (
                                <p className="image-filename">
                                  Odabrano: {variationGalleryFiles.length}
                                </p>
                              )}
                            </label>
                            {existingGallery.length > 0 && (
                              <div className="existing-images">
                                <p className="image-filename">Postojeće slike:</p>
                                <div className="image-preview-grid">
                                  {existingGallery.map((image, index) => (
                                    <div
                                      className="image-preview has-image"
                                      key={`${image}-${index}`}
                                    >
                                      <img
                                        src={image}
                                        alt={`Postojeća slika ${index + 1}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="variation-equipment">
                            <p className="variation-section-title">
                              Dodatna oprema
                            </p>
                            <div className="equipment-grid">
                              {equipmentEntries.length ? (
                                equipmentEntries.map(([key, value]) => {
                                  const isTextValue =
                                    typeof value === "string" ||
                                    typeof value === "number";
                                  if (isTextValue) {
                                    return (
                                      <label
                                        key={key}
                                        className="equipment-input"
                                      >
                                        <span>{key}</span>
                                        <input
                                          type="text"
                                          value={value ?? ""}
                                          onChange={(event) =>
                                            handleEquipmentChange(
                                              variationKey,
                                              key,
                                              event.target.value
                                            )
                                          }
                                        />
                                      </label>
                                    );
                                  }
                                  return (
                                    <label
                                      key={key}
                                      className="equipment-toggle"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={Boolean(value)}
                                        onChange={() =>
                                          handleInstanceToggle(variationKey, key)
                                        }
                                      />
                                      <span>{key}</span>
                                    </label>
                                  );
                                })
                              ) : (
                                <p className="secondary">Bez dodatne opreme</p>
                              )}
                            </div>
                            <div className="add-equipment">
                              <input
                                type="text"
                                placeholder="Naziv opreme"
                                value={newEntry.key || ""}
                                onChange={(event) =>
                                  setNewEquipment((prev) => ({
                                    ...prev,
                                    [variationKey]: {
                                      ...prev[variationKey],
                                      key: event.target.value,
                                    },
                                  }))
                                }
                              />
                              <input
                                type="text"
                                placeholder="Vrijednost (opciono)"
                                value={newValue}
                                onChange={(event) =>
                                  setNewEquipment((prev) => ({
                                    ...prev,
                                    [variationKey]: {
                                      ...prev[variationKey],
                                      value: event.target.value,
                                    },
                                  }))
                                }
                              />
                              <label className="equipment-flag">
                                <input
                                  type="checkbox"
                                  checked={newIsActive}
                                  disabled={hasTextValue}
                                  aria-label="Aktivno"
                                  onChange={(event) =>
                                    setNewEquipment((prev) => ({
                                      ...prev,
                                      [variationKey]: {
                                        ...prev[variationKey],
                                        isActive: event.target.checked,
                                      },
                                    }))
                                  }
                                />
                              </label>
                              <button
                                type="button"
                                className="ghost-action"
                                onClick={() => handleAddEquipment(variationKey)}
                              >
                                Dodaj opremu
                              </button>
                            </div>
                          </div>
                          <div className="variation-actions">
                            <button
                              type="button"
                              className="primary-action small"
                              disabled={instanceSaving[variationKey]}
                              onClick={() => handleVariationSave(variationKey)}
                            >
                              {instanceSaving[variationKey]
                                ? "Sačuvaj..."
                                : "Sačuvaj"}
                            </button>
                            <button
                              type="button"
                              className="ghost-action"
                              onClick={() => toggleVariation(variationKey)}
                            >
                              Poništi
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="alert-message">Nema varijacija za ovo vozilo.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="form-section price-section">
            <div className="section-heading">
              <div>
                <h3>Cjenovni periodi</h3>
                <p className="eyebrow">
                  Definišite raspon datuma i cijene po broju dana.
                </p>
              </div>
              <button
                type="button"
                className="ghost-action"
                onClick={handleResetPriceRange}
              >
                Resetuj raspon
              </button>
            </div>
            <div className="price-range-grid">
              <div className="price-calendar">
                <div className="calendar-header">
                  <button
                    type="button"
                    className="calendar-nav"
                    onClick={() =>
                      setCalendarMonth((prev) => addMonths(prev, -1))
                    }
                  >
                    <span aria-hidden="true">‹</span>
                  </button>
                  <div className="calendar-title">
                    {MONTH_LABELS[calendarData.month]} {calendarData.year}
                  </div>
                  <button
                    type="button"
                    className="calendar-nav"
                    onClick={() =>
                      setCalendarMonth((prev) => addMonths(prev, 1))
                    }
                  >
                    <span aria-hidden="true">›</span>
                  </button>
                </div>
                <div className="calendar-weekdays">
                  {WEEKDAY_LABELS.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div className="calendar-grid">
                  {calendarData.days.map((day) => {
                    const startMatch =
                      priceRange.startDate && day.iso === priceRange.startDate;
                    const endMatch =
                      priceRange.endDate && day.iso === priceRange.endDate;
                    const inRange =
                      day.iso &&
                      priceRange.startDate &&
                      priceRange.endDate &&
                      toDayNumber(day.iso) >= toDayNumber(priceRange.startDate) &&
                      toDayNumber(day.iso) <= toDayNumber(priceRange.endDate);
                    const existingCount = day.isCurrentMonth
                      ? getExistingCount(day.iso)
                      : 0;
                    const hasExisting = existingCount > 0;
                    const existingOverlap = existingCount > 1;
                    const className = `calendar-day${
                      day.isCurrentMonth ? "" : " outside"
                    }${inRange ? " in-range" : ""}${
                      startMatch ? " range-start" : ""
                    }${endMatch ? " range-end" : ""}${
                      hasExisting ? " has-existing" : ""
                    }${existingOverlap ? " has-overlap" : ""}`;
                    const title = hasExisting ? getExistingTitles(day.iso) : "";

                    return (
                      <button
                        type="button"
                        key={day.key}
                        className={className}
                        onClick={() => handleCalendarSelect(day.iso)}
                        disabled={!day.isCurrentMonth}
                        title={title}
                      >
                        <span className="day-number">{day.label || ""}</span>
                        {hasExisting && (
                          <span
                            className={`day-marker${
                              existingOverlap ? " overlap" : ""
                            }`}
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="calendar-legend">
                  <span className="legend-item">
                    <span className="legend-swatch in-range" />
                    Raspon
                  </span>
                  <span className="legend-item">
                    <span className="legend-swatch start" />
                    Početak
                  </span>
                  <span className="legend-item">
                    <span className="legend-swatch end" />
                    Kraj
                  </span>
                  <span className="legend-item">
                    <span className="legend-swatch existing" />
                    Postojeće cijene
                  </span>
                </div>
              </div>
              <div className="price-range-form">
                <div className="field-grid two-columns">
                  <label>
                    <span>Početni datum</span>
                    <input
                      type="date"
                      value={priceRange.startDate}
                      onChange={handlePriceRangeInput("startDate")}
                      className={priceErrors.startDate ? "input-invalid" : ""}
                    />
                    {priceErrors.startDate && (
                      <p className="field-error-text">
                        {priceErrors.startDate}
                      </p>
                    )}
                  </label>
                  <label>
                    <span>Krajnji datum</span>
                    <input
                      type="date"
                      value={priceRange.endDate}
                      onChange={handlePriceRangeInput("endDate")}
                      className={priceErrors.endDate ? "input-invalid" : ""}
                    />
                    {priceErrors.endDate && (
                      <p className="field-error-text">
                        {priceErrors.endDate}
                      </p>
                    )}
                  </label>
                </div>
              <div className="range-summary">
                  <p className="summary-label">Odabrani period</p>
                  <p className="summary-value">
                    {priceRange.startDate && priceRange.endDate
                      ? `${formatDisplayDate(priceRange.startDate)} - ${formatDisplayDate(
                          priceRange.endDate
                        )} (${rangeDays} dana)`
                      : "Raspon nije odabran."}
                  </p>
                  {overlappingPeriods.length > 0 && (
                    <p className="summary-warning">
                      Odabrani raspon se preklapa sa postojećim cijenama (
                      {overlappingPeriods.length}).
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="price-tiers">
              <div className="price-tier-header">
                <span>Min dana</span>
                <span>Max dana</span>
                <span>Cijena</span>
                <span />
              </div>
              {priceTiers.map((tier, index) => {
                const tierError = priceTierErrors[index] || {};
                return (
                  <div className="price-tier-row" key={`tier-${index}`}>
                    <label>
                      <input
                        type="number"
                        min="1"
                        value={tier.minDays ?? ""}
                        onChange={(event) =>
                          handlePriceTierChange(
                            index,
                            "minDays",
                            event.target.value
                          )
                        }
                        className={tierError.minDays ? "input-invalid" : ""}
                      />
                      {tierError.minDays && (
                        <p className="field-error-text">{tierError.minDays}</p>
                      )}
                    </label>
                    <label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Bez limita"
                        value={tier.maxDays ?? ""}
                        onChange={(event) =>
                          handlePriceTierChange(
                            index,
                            "maxDays",
                            event.target.value
                          )
                        }
                        className={tierError.maxDays ? "input-invalid" : ""}
                      />
                      {tierError.maxDays && (
                        <p className="field-error-text">{tierError.maxDays}</p>
                      )}
                    </label>
                    <label>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={tier.price ?? ""}
                        onChange={(event) =>
                          handlePriceTierChange(
                            index,
                            "price",
                            event.target.value
                          )
                        }
                        className={tierError.price ? "input-invalid" : ""}
                      />
                      {tierError.price && (
                        <p className="field-error-text">{tierError.price}</p>
                      )}
                    </label>
                    <button
                      type="button"
                      className="link-button danger"
                      onClick={() => handleRemovePriceTier(index)}
                      disabled={priceTiers.length === 1}
                    >
                      Ukloni
                    </button>
                  </div>
                );
              })}
              {typeof priceErrors.tiers === "string" && (
                <p className="field-error-text">{priceErrors.tiers}</p>
              )}
              <div className="price-tier-actions">
                <button
                  type="button"
                  className="ghost-action"
                  onClick={handleAddPriceTier}
                >
                  + Dodaj nivo
                </button>
              </div>
              <div className="tier-summary">
                {priceTiers.map((tier, index) => (
                  <div className="tier-chip" key={`tier-summary-${index}`}>
                    {formatTierLabel(tier)} ·{" "}
                    {tier.price ? `${tier.price} EUR` : "Bez cijene"}
                  </div>
                ))}
              </div>
            </div>
            <div className="form-actions price-save-actions">
              <button
                type="button"
                className="primary-action"
                onClick={handlePriceSave}
                disabled={priceSaving}
              >
                {priceSaving ? "Sačuvaj..." : "Sačuvaj cijene"}
              </button>
            </div>
            <div className="price-periods">
              <div className="price-periods-header"> 
                <button
                  type="button"
                  className="ghost-action"
                  onClick={() => loadPricePeriods()}
                  disabled={priceLoading}
                >
                  {priceLoading ? "Učitavam..." : "Osvježi"}
                </button>
              </div>
              {priceLoadError && (
                <p className="field-error-text">{priceLoadError}</p>
              )}
              {priceLoading && !pricePeriods.length ? (
                <div className="alert-message">Učitavanje cijena...</div>
              ) : pricePeriods.length ? (
                <div className="price-period-list">
                  {pricePeriods.map((period) => {
                    const isEditing = priceEditingId === period.id;
                    const editDraft =
                      priceEditDrafts[period.id] || buildPriceEditDraft(period);
                    const editErrors = priceEditErrors[period.id] || {};
                    const tierErrors = Array.isArray(editErrors.tiers)
                      ? editErrors.tiers
                      : [];
                    const periodDays = calculateRangeDays(
                      period.startingDate,
                      period.endingDate
                    );
                    const periodStart = toDayNumber(period.startingDate);
                    const periodEnd = toDayNumber(period.endingDate);
                    const overlapsSelection =
                      Number.isFinite(selectedStart) &&
                      Number.isFinite(selectedEnd) &&
                      Number.isFinite(periodStart) &&
                      Number.isFinite(periodEnd) &&
                      periodStart <= selectedEnd &&
                      periodEnd >= selectedStart;
                    return (
                      <div className="price-period-card" key={period.id}>
                        <div className="price-period-header">
                          <div className="price-period-title">
                            <span className="period-label">
                              Cjenovni period
                            </span>
                            <span className="period-range">
                              {formatDisplayDate(period.startingDate)} -{" "}
                              {formatDisplayDate(period.endingDate)}
                            </span>
                            {periodDays ? (
                              <span className="period-days">
                                {periodDays} dana
                              </span>
                            ) : null}
                            <span className="period-id">ID #{period.id}</span>
                            {overlapsSelection ? (
                              <span className="period-overlap">
                                Preklapa se sa izborom
                              </span>
                            ) : null}
                          </div>
                          <div className="price-period-actions">
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() => handlePriceEditStart(period)}
                              aria-label="Uredi period"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                aria-hidden="true"
                              >
                                <path
                                  fill="currentColor"
                                  d="M16.5 3.5a2.1 2.1 0 0 1 3 3l-9.4 9.4-4.1.6.6-4.1 9.4-9.4zm-2.1 3.5L6.1 15.3l-.2 1.4 1.4-.2L15.6 8.2l-1.2-1.2z"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="icon-button danger"
                              onClick={() => handlePriceDelete(period.id)}
                              aria-label="Obriši period"
                              disabled={priceDeleteLoading[period.id]}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                aria-hidden="true"
                              >
                                <path
                                  fill="currentColor"
                                  d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        {isEditing ? (
                          <div className="price-period-edit">
                            <div className="field-grid two-columns">
                              <label>
                                <span>Početni datum</span>
                                <input
                                  type="date"
                                  value={editDraft.startDate}
                                  onChange={(event) =>
                                    handlePriceEditFieldChange(
                                      period.id,
                                      "startDate",
                                      event.target.value
                                    )
                                  }
                                  className={
                                    editErrors.startDate ? "input-invalid" : ""
                                  }
                                />
                                {editErrors.startDate && (
                                  <p className="field-error-text">
                                    {editErrors.startDate}
                                  </p>
                                )}
                              </label>
                              <label>
                                <span>Krajnji datum</span>
                                <input
                                  type="date"
                                  value={editDraft.endDate}
                                  onChange={(event) =>
                                    handlePriceEditFieldChange(
                                      period.id,
                                      "endDate",
                                      event.target.value
                                    )
                                  }
                                  className={
                                    editErrors.endDate ? "input-invalid" : ""
                                  }
                                />
                                {editErrors.endDate && (
                                  <p className="field-error-text">
                                    {editErrors.endDate}
                                  </p>
                                )}
                              </label>
                            </div>
                            <div className="price-tier-header small">
                              <span>Min dana</span>
                              <span>Max dana</span>
                              <span>Cijena</span>
                              <span />
                            </div>
                            <div className="price-tier-list">
                              {(editDraft.tiers || []).map((tier, index) => {
                                const tierError = tierErrors[index] || {};
                                return (
                                  <div
                                    className="price-tier-row"
                                    key={`edit-${period.id}-${index}`}
                                  >
                                    <label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={tier.minDays ?? ""}
                                        onChange={(event) =>
                                          handlePriceEditTierChange(
                                            period.id,
                                            index,
                                            "minDays",
                                            event.target.value
                                          )
                                        }
                                        className={
                                          tierError.minDays
                                            ? "input-invalid"
                                            : ""
                                        }
                                      />
                                      {tierError.minDays && (
                                        <p className="field-error-text">
                                          {tierError.minDays}
                                        </p>
                                      )}
                                    </label>
                                    <label>
                                      <input
                                        type="number"
                                        min="1"
                                        placeholder="Bez limita"
                                        value={tier.maxDays ?? ""}
                                        onChange={(event) =>
                                          handlePriceEditTierChange(
                                            period.id,
                                            index,
                                            "maxDays",
                                            event.target.value
                                          )
                                        }
                                        className={
                                          tierError.maxDays
                                            ? "input-invalid"
                                            : ""
                                        }
                                      />
                                      {tierError.maxDays && (
                                        <p className="field-error-text">
                                          {tierError.maxDays}
                                        </p>
                                      )}
                                    </label>
                                    <label>
                                      <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={tier.price ?? ""}
                                        onChange={(event) =>
                                          handlePriceEditTierChange(
                                            period.id,
                                            index,
                                            "price",
                                            event.target.value
                                          )
                                        }
                                        className={
                                          tierError.price
                                            ? "input-invalid"
                                            : ""
                                        }
                                      />
                                      {tierError.price && (
                                        <p className="field-error-text">
                                          {tierError.price}
                                        </p>
                                      )}
                                    </label>
                                    <button
                                      type="button"
                                      className="link-button danger"
                                      onClick={() =>
                                        handlePriceEditRemoveTier(
                                          period.id,
                                          index
                                        )
                                      }
                                      disabled={editDraft.tiers.length === 1}
                                    >
                                      Ukloni
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                            {typeof editErrors.tiers === "string" && (
                              <p className="field-error-text">
                                {editErrors.tiers}
                              </p>
                            )}
                            <div className="price-tier-actions">
                              <button
                                type="button"
                                className="ghost-action"
                                onClick={() => handlePriceEditAddTier(period.id)}
                              >
                                + Dodaj nivo
                              </button>
                            </div>
                            <div className="variation-actions">
                              <button
                                type="button"
                                className="primary-action small"
                                onClick={() => handlePriceEditSave(period.id)}
                                disabled={priceEditSaving[period.id]}
                              >
                                {priceEditSaving[period.id]
                                  ? "Sačuvaj..."
                                  : "Sačuvaj"}
                              </button>
                              <button
                                type="button"
                                className="ghost-action"
                                onClick={handlePriceEditCancel}
                              >
                                Poništi
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="price-period-tiers">
                            {period.tiers.length ? (
                              period.tiers.map((tier) => (
                                <div
                                  className="price-period-tier"
                                  key={`tier-${period.id}-${tier.id || tier.minDays}`}
                                >
                                  {formatTierLabel(tier)} · {tier.price} EUR
                                </div>
                              ))
                            ) : (
                              <span className="secondary">
                                Nema definisanih nivoa.
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="alert-message">Nema definisanih cijena.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
