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
  adminLogout,
} from "@/lib/adminApi";

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

const VariationImageUpload = ({ label = "Slika varijacije" }) => {
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const objectUrlRef = useRef("");

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = "";
      }
    },
    []
  );

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = "";
      }
      setPreview("");
      setFileName("");
      return;
    }
    const url = URL.createObjectURL(file);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = url;
    setPreview(url);
    setFileName(file.name);
  };

  return (
    <div className="image-upload">
      <label className="image-upload-label">
        <span>{label}</span>
        <div className="image-upload-control">
          <div className={`image-preview ${preview ? "has-image" : ""}`}>
            {preview ? <img src={preview} alt={label} /> : <span>Dodaj sliku</span>}
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>
        {fileName && <p className="image-filename">{fileName}</p>}
      </label>
    </div>
  );
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
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const variationRefs = useRef({});
  const registrationInputRefs = useRef({});
  const imageObjectUrlRef = useRef("");
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
        const defaultImage =
          resolvedCar?.image || resolvedCar?.images?.[0] || "";
        if (defaultImage) {
          setImagePreview((prev) => prev || defaultImage);
        }
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
    };
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (imageObjectUrlRef.current) {
      URL.revokeObjectURL(imageObjectUrlRef.current);
      imageObjectUrlRef.current = "";
    }
    if (!file) {
      setImageName("");
      return;
    }
    const url = URL.createObjectURL(file);
    imageObjectUrlRef.current = url;
    setImagePreview(url);
    setImageName(file.name);
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
      const response = await adminUpdateCar(carId, {
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
      });
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
    setExpandedVariations((prev) => {
      const next = { ...prev };
      delete next[variationKey];
      return next;
    });
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

  if (loading) {
    return <div className="alert-message">Učitavanje...</div>;
  }
  if (error) {
    return <div className="alert-message error">{error}</div>;
  }
  if (!car) {
    return <div className="alert-message">Vozilo nije pronađeno.</div>;
  }

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
                </label>
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
        ) : (
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
                          <span className="variation-thumb" aria-hidden="true" />
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
                            <VariationImageUpload />
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
        )}
      </div>
    </div>
  );
}
