"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

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

const DEFAULT_VALUES = {
  vehicleName: "",
  enginePower: "",
  engine: "",
  engineType: "",
  fuelType: "",
  yearOfManufacture: "",
  transmissionType: "",
  colorItem: "",
  seatsNumber: "",
  doorNumber: "",
  doesHaveAirConditioning: false,
  description: "",
  equipment: {},
};

const EMPTY_INITIAL_VALUES = {};
const EMPTY_VALIDATION_ERRORS = {};
const MAX_NAME_LENGTH = 255;
const MAX_COLOR_LENGTH = 30;
const YEAR_MIN = 1990;
const YEAR_MAX = 2026;

const numericFields = [
  "enginePower",
  "engine",
  "yearOfManufacture",
  "seatsNumber",
  "doorNumber",
];

export default function CarForm({
  initialValues = EMPTY_INITIAL_VALUES,
  onSubmit,
  submitLabel = "Sačuvaj",
  disabled = false,
  showEquipmentSection = true,
  equipmentDisabled = false,
  validationErrors = EMPTY_VALIDATION_ERRORS,
}) {
  const [values, setValues] = useState({
    ...DEFAULT_VALUES,
    ...initialValues,
    doesHaveAirConditioning: Boolean(initialValues.doesHaveAirConditioning),
  });
  const [coverPreview, setCoverPreview] = useState("");
  const [coverName, setCoverName] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [equipmentInput, setEquipmentInput] = useState({ name: "", value: "" });
  const coverObjectUrlRef = useRef("");
  const galleryObjectUrlsRef = useRef([]);

  useEffect(() => {
    setValues((prev) => ({
      ...DEFAULT_VALUES,
      ...initialValues,
      doesHaveAirConditioning: Boolean(initialValues.doesHaveAirConditioning),
    }));
  }, [initialValues]);

  useEffect(() => {
    if (!validationErrors || !Object.keys(validationErrors).length) {
      return;
    }
    setFieldErrors((prev) => ({ ...prev, ...validationErrors }));
  }, [validationErrors]);

  useEffect(
    () => () => {
      if (coverObjectUrlRef.current) {
        URL.revokeObjectURL(coverObjectUrlRef.current);
        coverObjectUrlRef.current = "";
      }
      if (galleryObjectUrlsRef.current.length) {
        galleryObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        galleryObjectUrlsRef.current = [];
      }
    },
    []
  );

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (field) => (event) => {
    const value = event.target.type === "checkbox"
      ? event.target.checked
      : event.target.value;
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    clearFieldError(field);
  };

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];
    if (coverObjectUrlRef.current) {
      URL.revokeObjectURL(coverObjectUrlRef.current);
      coverObjectUrlRef.current = "";
    }
    if (!file) {
      setCoverFile(null);
      setCoverPreview("");
      setCoverName("");
      return;
    }
    const url = URL.createObjectURL(file);
    coverObjectUrlRef.current = url;
    setCoverFile(file);
    setCoverPreview(url);
    setCoverName(file.name);
    clearFieldError("coverImage");
  };

  const handleGalleryChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (galleryObjectUrlsRef.current.length) {
      galleryObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      galleryObjectUrlsRef.current = [];
    }
    if (!files.length) {
      setGalleryFiles([]);
      setGalleryPreviews([]);
      return;
    }
    const previews = files.map((file) => {
      const url = URL.createObjectURL(file);
      galleryObjectUrlsRef.current.push(url);
      return { name: file.name, url };
    });
    setGalleryFiles(files);
    setGalleryPreviews(previews);
    clearFieldError("images");
  };

  const validateForm = (currentValues) => {
    const errors = {};
    const nameValue = String(currentValues.vehicleName || "").trim();
    if (nameValue.length > MAX_NAME_LENGTH) {
      errors.vehicleName =
        "Vrijednost mora biti text on najvise 255 znakova.";
    }

    const colorValue = String(currentValues.colorItem || "").trim();
    if (colorValue.length > MAX_COLOR_LENGTH) {
      errors.colorItem =
        "Vrijednost mora biti text on najvise 30 znakova.";
    }

    const integerFields = [
      "enginePower",
      "engine",
      "seatsNumber",
      "doorNumber",
    ];
    integerFields.forEach((field) => {
      const value = currentValues[field];
      if (value === "" || value === null || value === undefined) {
        return;
      }
      const numeric = Number(value);
      if (!Number.isInteger(numeric)) {
        errors[field] = "Vrijednost mora biti cio broj.";
      }
    });

    const yearValue = currentValues.yearOfManufacture;
    if (yearValue !== "" && yearValue !== null && yearValue !== undefined) {
      const yearNumeric = Number(yearValue);
      if (
        !Number.isInteger(yearNumeric) ||
        yearNumeric < YEAR_MIN ||
        yearNumeric > YEAR_MAX
      ) {
        errors.yearOfManufacture =
          "Vrijednost mora biti cio broj izmedju 1990 i 2026.";
      }
    }

    const engineTypeValue = currentValues.engineType;
    if (
      engineTypeValue &&
      !["P", "D", "H"].includes(String(engineTypeValue).toUpperCase())
    ) {
      errors.engineType =
        "Dozvoljene vrijednosti su: P(benzin), D(dizel), H(hibrid).";
    }

    const fuelTypeValue = currentValues.fuelType;
    if (
      fuelTypeValue &&
      !["P", "D"].includes(String(fuelTypeValue).toUpperCase())
    ) {
      errors.fuelType = "Dozvoljene vrijednosti su: P(benzin), D(dizel).";
    }

    const transmissionValue = currentValues.transmissionType;
    if (
      transmissionValue &&
      !["A", "M", "SA"].includes(String(transmissionValue).toUpperCase())
    ) {
      errors.transmissionType =
        "Dozvoljene vrijednosti su: A(automatik), M(manuelni) i SA (polu automatik).";
    }

    return errors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (disabled) return;
    const validation = validateForm(values);
    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      toast.error("Provjeri unos");
      return;
    }
    setFieldErrors({});
    const { description: _description, ...payloadValues } = values;
    const payload = {
      ...payloadValues,
      equipment: values.equipment || {},
      coverImage: coverFile || undefined,
      images: galleryFiles.length ? galleryFiles : undefined,
    };
    numericFields.forEach((field) => {
      const numeric = Number(payload[field]);
      payload[field] = Number.isNaN(numeric) ? undefined : numeric;
    });
    onSubmit?.(payload);
  };

  const handleAddEquipment = () => {
    if (!equipmentInput.name.trim()) {
      return;
    }
    setValues((prev) => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [equipmentInput.name.trim()]:
          equipmentInput.value === ""
            ? true
            : equipmentInput.value.toLowerCase() === "true"
            ? true
            : equipmentInput.value.toLowerCase() === "false"
            ? false
            : equipmentInput.value,
      },
    }));
    setEquipmentInput({ name: "", value: "" });
  };

  const removeEquipment = (key) => {
    setValues((prev) => {
      const equipment = { ...prev.equipment };
      delete equipment[key];
      return { ...prev, equipment };
    });
  };

  const fieldDefinitions = useMemo(
    () => [
      {
        label: "Naziv vozila",
        field: "vehicleName",
        type: "text",
        maxLength: MAX_NAME_LENGTH,
      },
      {
        label: "Godina proizvodnje",
        field: "yearOfManufacture",
        type: "number",
        min: YEAR_MIN,
        max: YEAR_MAX,
        step: 1,
        inputMode: "numeric",
      },
      {
        label: "Menjač",
        field: "transmissionType",
        type: "select",
        options: TRANSMISSION_OPTIONS,
      },
      {
        label: "Snaga motora (hp)",
        field: "enginePower",
        type: "number",
        step: 1,
        inputMode: "numeric",
      },
      {
        label: "Zapremina motora (cc)",
        field: "engine",
        type: "number",
        step: 1,
        inputMode: "numeric",
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
      {
        label: "Boja",
        field: "colorItem",
        type: "text",
        maxLength: MAX_COLOR_LENGTH,
      },
      {
        label: "Broj sjedišta",
        field: "seatsNumber",
        type: "number",
        step: 1,
        inputMode: "numeric",
      },
      {
        label: "Broj vrata",
        field: "doorNumber",
        type: "number",
        step: 1,
        inputMode: "numeric",
      },
    ],
    []
  );

  return (
    <form className="car-edit-form" onSubmit={handleSubmit}>
      <div className="section-heading">Osnovni podaci</div>
      <div className="car-edit-grid">
        {fieldDefinitions.map((field) => {
          const invalid = fieldErrors[field.field];
          const sharedProps = {
            value: values[field.field] ?? "",
            onChange: handleChange(field.field),
            className: invalid ? "input-invalid" : "",
          };
          return (
            <label key={field.field}>
              <span>{field.label}</span>
              {field.type === "select" && field.options ? (
                <select {...sharedProps}>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  maxLength={field.maxLength}
                  inputMode={field.inputMode}
                  {...sharedProps}
                />
              )}
              {invalid && <p className="field-error-text">{invalid}</p>}
            </label>
          );
        })}
        <label>
          <span>Klima</span>
          <input type="checkbox" checked={values.doesHaveAirConditioning} onChange={handleChange("doesHaveAirConditioning")} />
        </label>
      </div>
      <div className="section-heading">Slike vozila</div>
      <div className="car-edit-images">
        <div className="image-upload">
          <label className="image-upload-label">
            <span>Cover slika</span>
            <div className="image-upload-control">
              <div className={`image-preview ${coverPreview ? "has-image" : ""}`}>
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover slika vozila" />
                ) : (
                  <span>Dodaj sliku</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                disabled={disabled}
              />
            </div>
            {coverName && <p className="image-filename">{coverName}</p>}
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
                disabled={disabled}
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
        </div>
      </div>
      <label className="full">
        <span>Opis</span>
        <textarea rows={4} value={values.description} onChange={handleChange("description")} />
        {fieldErrors.description && (
          <p className="field-error-text">{fieldErrors.description}</p>
        )}
      </label>
      {showEquipmentSection && (
        <div className="equipment-form">
          <strong>Dodatna oprema</strong>
          <div className="equipment-inputs">
            <input
              type="text"
              placeholder="Naziv opreme"
              value={equipmentInput.name}
              onChange={(event) => setEquipmentInput((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              type="text"
              placeholder="Vrednost (true/false/tekst)"
              value={equipmentInput.value}
              onChange={(event) => setEquipmentInput((prev) => ({ ...prev, value: event.target.value }))}
            />
            <button type="button" className="theme-btn ghost" onClick={handleAddEquipment} disabled={equipmentDisabled}>
              Dodaj
            </button>
          </div>
          <div className="equipment-list">
            {Object.entries(values.equipment || {}).map(([key, value]) => (
              <div className="equipment-pill" key={key}>
                <span>
                  {key}: {String(value)}
                </span>
                <button type="button" onClick={() => removeEquipment(key)} aria-label="Ukloni opremu">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <button type="submit" className="theme-btn" disabled={disabled}>
        {submitLabel}
      </button>
    </form>
  );
}
