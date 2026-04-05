"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  adminGetReservation,
  adminGetReservations,
  adminUpdateReservation,
  adminGetCarInstance,
  adminGetCar,
  adminGetAvailableVehicles,
  adminLogout,
} from "@/lib/adminApi";
import { useSearchParams } from "next/navigation";
import { fetchCities, fetchReservationItems } from "@/lib/inventoryApi";
import CityAutocomplete from "@/components/common/CityAutocomplete";
import PhoneInput from "@/components/common/PhoneInput";
import TIME_OPTIONS from "@/lib/timeOptions";

const ALL_STATUS_OPTIONS = [
  { value: 0, label: "Na čekanju" },
  { value: 1, label: "Odbijena" },
  { value: 2, label: "Prihvaćena" },
];

const getStatusOptions = (currentStatus) => {
  if (currentStatus === 0) {
    return ALL_STATUS_OPTIONS;
  }
  return ALL_STATUS_OPTIONS.filter((s) => s.value !== 0);
};

const STATUS_CLASSES = {
  0: "status--pending",
  1: "status--rejected",
  2: "status--accepted",
};

const FIELD_MAP = {
  vehicleCode: "vehicleCode",
  carPickUpDateTime: "pickupDate",
  carDropOffDateTime: "dropoffDate",
  pickUpLocationId: "editPickupLocation",
  dropOffLocationId: "editDropoffLocation",
  pickUpAdditionalLocation: "pickUpAdditionalLocation",
  dropOffAdditionalLocation: "dropOffAdditionalLocation",
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  phoneNumber: "phoneNumber",
  status: "status",
  language: "language",
};

const VALIDATION_MESSAGES = {
  "reservation.pick_up_date.must_be_future": "Datum preuzimanja mora biti u budućnosti.",
  "reservation.drop_off_date.must_be_after_pick_up": "Datum vraćanja mora biti poslije datuma preuzimanja.",
  "reservation.phone_number.invalid": "Neispravan format broja telefona. Koristite međunarodni format (npr. +382XX123456).",
  "reservation.email.invalid": "Neispravna email adresa.",
  "reservation.first_name.blank": "Ime je obavezno.",
  "reservation.last_name.blank": "Prezime je obavezno.",
  "reservation.email.blank": "Email je obavezan.",
  "reservation.phone_number.blank": "Broj telefona je obavezan.",
  "reservation.vehicle_code.blank": "Kod vozila je obavezan.",
  "reservation.pick_up_date.blank": "Datum preuzimanja je obavezan.",
  "reservation.drop_off_date.blank": "Datum vraćanja je obavezan.",
  "reservation.pick_up_location.blank": "Lokacija preuzimanja je obavezna.",
  "reservation.drop_off_location.blank": "Lokacija vraćanja je obavezna.",
  "reservation.pick_up_location.invalid": "Neispravna lokacija preuzimanja.",
  "reservation.drop_off_location.invalid": "Neispravna lokacija vraćanja.",
  "reservation.pick_up_location_id.required": "Lokacija preuzimanja je obavezna.",
  "reservation.drop_off_location_id.required": "Lokacija vraćanja je obavezna.",
  "reservation.invalid_status": "Nevažeći status.",
  "reservation.language.invalid": "Nevažeći jezik.",
  "reservation.missing_name": "Ime i prezime su obavezni.",
  "reservation.missing_email": "Email je obavezan.",
  "reservation.missing_phone_number": "Broj telefona je obavezan.",
  "reservation.negative_total_price": "Greška u obračunu cijene.",
  "reservation.pick_up_date.invalid": "Neispravan datum preuzimanja.",
  "reservation.drop_off_date.invalid": "Neispravan datum vraćanja.",
  "reservation.vehicle_code.invalid": "Neispravni kod vozila.",
  "reservation.reservation_items.invalid": "Neispravne stavke rezervacije.",
  "This value should not be blank.": "Ovo polje je obavezno.",
  "This value is not valid.": "Ova vrijednost nije ispravna.",
  "This field is missing.": "Ovo polje nedostaje.",
};

const parseFieldErrors = (payload) => {
  if (
    payload?.messageCode !== "validation.failed" ||
    !Array.isArray(payload?.parameters)
  ) {
    return null;
  }
  const errors = {};
  for (const param of payload.parameters) {
    const frontField = FIELD_MAP[param.field] || param.field;
    errors[frontField] = VALIDATION_MESSAGES[param.message] || param.message;
  }
  return Object.keys(errors).length ? errors : null;
};

const DOMAIN_ERROR_MESSAGES = {
  "car_price.not_found.for_period": "Nema cijena za odabrani period.",
  "car_price.not_found.for_car": "Cijene nisu konfigurisane za ovo vozilo.",
  "car_price.gap.non_contiguous_ranges": "Cijene su nepotpune za odabrani period.",
  "price_tier.not_found.for_duration": "Nema cijena za ovo trajanje najma.",
  "car_instance.not_found.by_code": "Vozilo nije pronađeno.",
  "vehicle.not_available.for_period": "Vozilo nije dostupno za odabrani period.",
  "vehicle.not_available.no_alternative": "Nijedno dostupno vozilo nije pronađeno za odabrani period.",
  "vehicle.already_booked": "Vozilo je upravo rezervisano. Pokušajte ponovo.",
  "date_range.drop_off_before_pick_up": "Datum vraćanja mora biti poslije datuma preuzimanja.",
  "date_range.ending_before_starting": "Krajnji datum mora biti poslije početnog datuma.",
  "reservation.negative_total_price": "Greška u obračunu cijene.",
  "reservation.invalid_status": "Nevažeći status ili nedozvoljena promjena statusa.",
  "reservation.missing_name": "Ime i prezime su obavezni.",
  "reservation.missing_email": "Email je obavezan.",
  "reservation.missing_phone_number": "Broj telefona je obavezan.",
  "reservation.not_found.by_id": "Rezervacija nije pronađena.",
};

const resolveDomainError = (payload) => {
  const code = payload?.messageCode;
  if (code && DOMAIN_ERROR_MESSAGES[code]) {
    return DOMAIN_ERROR_MESSAGES[code];
  }
  return null;
};

const ITEM_LABELS = {
  days: "Najam",
  seat: "Dječije sjedište",
  booster: "Booster sjedište",
  border_cross: "Prelazak granice",
  city_deliver: "Dostava na preuzimanje",
  city_drop_off: "Dostava na vraćanje",
};

const STATUS_LABELS = {
  0: "Na čekanju",
  1: "Odbijena",
  2: "Prihvaćena",
};

const formatSimpleDateTime = (str) => {
  if (!str || typeof str !== "string") return "—";
  const d = new Date(str.replace(" ", "T"));
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString("sr-Latn-ME", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const parseDateTimeField = (dateObj) => {
  if (!dateObj) return { date: "", time: "" };
  const raw = dateObj?.date || dateObj;
  if (typeof raw !== "string") return { date: "", time: "" };
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}):(\d{2})/);
  if (match) {
    const date = match[1];
    const h = match[2];
    const m = parseInt(match[3], 10) < 30 ? "00" : "30";
    return { date, time: `${h}:${m}` };
  }
  const d = new Date(raw);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  const date = raw.slice(0, 10);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = d.getUTCMinutes() < 30 ? "00" : "30";
  return { date, time: `${h}:${m}` };
};

const formatDateTime = (dateObj) => {
  if (!dateObj) return "—";
  const raw = dateObj?.date || dateObj;
  if (typeof raw !== "string") return "—";
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (match) {
    return `${match[3]}.${match[2]}.${match[1]}. ${match[4]}:${match[5]}`;
  }
  return "—";
};

export default function ReservationDetail({ reservationId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const regFromList = searchParams?.get("reg") || "";
  const [reservation, setReservation] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [carInfo, setCarInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const alertRef = React.useRef(null);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState("");
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [cities, setCities] = useState([]);
  const [availableExtras, setAvailableExtras] = useState([]);

  const [form, setForm] = useState({
    vehicleCode: "",
    pickupDate: "",
    pickupTime: "",
    dropoffDate: "",
    dropoffTime: "",
    pickupLocation: "",
    dropoffLocation: "",
    pickUpAdditionalLocation: "",
    dropOffAdditionalLocation: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    status: 0,
    language: "me",
    reservationItems: [],
  });

  useEffect(() => {
    fetchCities()
      .then(setCities)
      .catch(() => setCities([]));
    fetchReservationItems()
      .then(setAvailableExtras)
      .catch(() => setAvailableExtras([]));
  }, []);

  useEffect(() => {
    if (reservation && cities.length) {
      setForm((prev) => ({
        ...prev,
        pickupLocation:
          prev.pickupLocation ||
          resolveCityName(reservation.pickUpLocationName, reservation.pickUpLocationId),
        dropoffLocation:
          prev.dropoffLocation ||
          resolveCityName(reservation.dropOffLocationName, reservation.dropOffLocationId),
      }));
    }
  }, [cities, reservation]);

  const vehicleDetailsLoadedRef = React.useRef(false);
  useEffect(() => {
    if (vehicleDetailsLoadedRef.current) return;

    const loadVehicleDetails = (regNumber) => {
      if (!regNumber) return;
      vehicleDetailsLoadedRef.current = true;
      adminGetCarInstance(regNumber)
        .then((info) => {
          setVehicleInfo(info);
          if (info?.carId) {
            adminGetCar(info.carId)
              .then(setCarInfo)
              .catch(() => setCarInfo(null));
          }
        })
        .catch(() => setVehicleInfo(null));
    };

    if (regFromList) {
      loadVehicleDetails(regFromList);
    } else if (reservation) {
      adminGetReservations({ limit: 100 })
        .then((payload) => {
          const match = (payload?.data || []).find(
            (r) => String(r.id) === String(reservationId)
          );
          if (match?.registrationNumber) {
            loadVehicleDetails(match.registrationNumber);
          }
        })
        .catch(() => {});
    }
  }, [regFromList, reservation, reservationId]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    adminGetReservation(reservationId, { signal: controller.signal })
      .then((payload) => {
        setReservation(payload);
        populateForm(payload);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        if (err?.status === 401) {
          adminLogout().then(() => router.push("/admin"));
          return;
        }
        setError(err?.message || "Greška pri učitavanju rezervacije.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [reservationId, router]);

  const resolveCityName = (name, id) => {
    if (name) return name;
    if (id && cities.length) {
      const found = cities.find((c) => c.id === id);
      if (found) return found.name;
    }
    return "";
  };

  const populateForm = (r) => {
    const pickup = parseDateTimeField(r.carPickUpDateTime);
    const dropoff = parseDateTimeField(r.carDropOffDateTime);
    const extras = Array.isArray(r.reservationItemsPrices)
      ? r.reservationItemsPrices
          .map((i) => i.code)
          .filter((c) => c !== "days" && c !== "city_deliver" && c !== "city_drop_off")
      : [];
    setForm({
      vehicleCode: r.vehicleCode || "",
      pickupDate: pickup.date,
      pickupTime: pickup.time,
      dropoffDate: dropoff.date,
      dropoffTime: dropoff.time,
      pickupLocation: resolveCityName(r.pickUpLocationName, r.pickUpLocationId),
      dropoffLocation: resolveCityName(r.dropOffLocationName, r.dropOffLocationId),
      pickUpAdditionalLocation: r.pickUpAdditionalLocation || "",
      dropOffAdditionalLocation: r.dropOffAdditionalLocation || "",
      firstName: r.firstName || "",
      lastName: r.lastName || "",
      email: r.email || "",
      phoneNumber: r.phoneNumber || "",
      status: r.status ?? 0,
      language: r.language || "me",
      reservationItems: extras,
    });
  };

  const handleCancel = () => {
    if (reservation) populateForm(reservation);
    setEditing(false);
    setSaveError("");
    setSaveSuccess(false);
    setFieldErrors({});
  };

  const handleExtraToggle = (code) => {
    setForm((prev) => ({
      ...prev,
      reservationItems: prev.reservationItems.includes(code)
        ? prev.reservationItems.filter((c) => c !== code)
        : [...prev.reservationItems, code],
    }));
  };

  const handleLoadVehicles = async () => {
    if (!form.pickupDate || !form.pickupTime || !form.dropoffDate || !form.dropoffTime) {
      setVehiclesError("Potrebni su datum i vrijeme preuzimanja i vraćanja.");
      return;
    }
    if (!carInfo?.id) {
      setVehiclesError("Podaci o vozilu se još učitavaju. Pokušajte ponovo.");
      return;
    }
    setVehiclesLoading(true);
    setVehiclesError("");
    try {
      const result = await adminGetAvailableVehicles({
        carId: carInfo.id,
        reservationId: reservationId,
        startingDateTime: `${form.pickupDate} ${form.pickupTime}`,
        endingDateTime: `${form.dropoffDate} ${form.dropoffTime}`,
      });
      setAvailableVehicles(result?.data || []);
      setShowVehiclePicker(true);
    } catch (err) {
      setVehiclesError(err?.message || "Greška pri učitavanju vozila.");
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleSelectVehicle = (vehicle) => {
    if (vehicle.vehicleCode === form.vehicleCode) return;
    setForm({ ...form, vehicleCode: vehicle.vehicleCode });
    setVehicleInfo((prev) => ({
      ...prev,
      registrationNumber: vehicle.registrationNumber,
      code: vehicle.vehicleCode,
    }));
    setShowVehiclePicker(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    setFieldErrors({});

    const pickUpLocationId =
      cities.find((c) => c.name === form.pickupLocation)?.id || null;
    const dropOffLocationId =
      cities.find((c) => c.name === form.dropoffLocation)?.id || null;

    const payload = {
      vehicleCode: form.vehicleCode,
      carPickUpDateTime: `${form.pickupDate} ${form.pickupTime}`,
      carDropOffDateTime: `${form.dropoffDate} ${form.dropoffTime}`,
      pickUpLocationId,
      dropOffLocationId,
      pickUpAdditionalLocation: form.pickUpAdditionalLocation || undefined,
      dropOffAdditionalLocation: form.dropOffAdditionalLocation || undefined,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      status: form.status,
      language: form.language,
      reservationItems: form.reservationItems,
    };

    try {
      const result = await adminUpdateReservation(reservationId, payload);

      const newRegNumber =
        availableVehicles.find((v) => v.vehicleCode === form.vehicleCode)
          ?.registrationNumber ||
        vehicleInfo?.registrationNumber ||
        regFromList;

      const pickupCityName =
        cities.find((c) => c.id === pickUpLocationId)?.name || form.pickupLocation;
      const dropoffCityName =
        cities.find((c) => c.id === dropOffLocationId)?.name || form.dropoffLocation;

      const merged = {
        ...reservation,
        ...result,
        pickUpLocationName: result.pickUpLocationName || pickupCityName,
        dropOffLocationName: result.dropOffLocationName || dropoffCityName,
      };

      setReservation(merged);
      populateForm(merged);
      setShowVehiclePicker(false);
      setAvailableVehicles([]);

      if (newRegNumber) {
        try {
          const info = await adminGetCarInstance(newRegNumber);
          setVehicleInfo(info);
          if (info?.carId) {
            const car = await adminGetCar(info.carId);
            setCarInfo(car);
          }
        } catch {
          // vehicle info fetch failed
        }
      }

      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } catch (err) {
      const errors = parseFieldErrors(err?.payload);
      if (errors) {
        setFieldErrors(errors);
        const firstField = Object.keys(errors)[0];
        if (firstField) {
          const el = document.getElementById(`edit-${firstField}`) ||
            document.getElementById(firstField);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.focus();
          }
        }
        setSaveError("Provjerite formu i ispravite greške.");
      } else {
        const domainMsg = resolveDomainError(err?.payload);
        setSaveError(domainMsg || err?.message || "Greška pri ažuriranju rezervacije.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || (!reservation && !error)) return <p className="text">Učitavanje rezervacije...</p>;
  if (error) return <p className="alert-error">{error}</p>;
  if (!reservation) return <p className="text">Rezervacija nije pronađena.</p>;

  const r = reservation;
  const itemsPrices = Array.isArray(r.reservationItemsPrices)
    ? r.reservationItemsPrices
    : [];

  return (
    <div className="reservation-detail">
      <div className="reservation-detail__header">
        <h3 className="title">Rezervacija #{r.id}</h3>
        <span className={`status-badge ${STATUS_CLASSES[r.status] || ""}`}>
          {ALL_STATUS_OPTIONS.find((s) => s.value === r.status)?.label ?? r.status}
        </span>
        {!editing && (
          <button
            className="side-btn admin-edit-btn"
            onClick={() => {
              setEditing(true);
              setSaveSuccess(false);
            }}
          >
            Uredi
          </button>
        )}
      </div>

      <div ref={alertRef}>
        {saveSuccess && (
          <p className="alert-success">Rezervacija je uspješno ažurirana.</p>
        )}
      </div>

      {editing ? (
        <div className="reservation-edit-form">
          <div className="reservation-detail__grid">
            <div className="detail-card">
              <h4 className="detail-card__title">Gost</h4>
              <div className="edit-fields">
                <div className="edit-row">
                  <label>Ime</label>
                  <input
                    id="edit-firstName"
                    type="text"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                  />
                  {fieldErrors.firstName && <span className="field-error-inline">{fieldErrors.firstName}</span>}
                </div>
                <div className="edit-row">
                  <label>Prezime</label>
                  <input
                    id="edit-lastName"
                    type="text"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                  />
                  {fieldErrors.lastName && <span className="field-error-inline">{fieldErrors.lastName}</span>}
                </div>
                <div className="edit-row">
                  <label>Email</label>
                  <input
                    id="edit-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                  {fieldErrors.email && <span className="field-error-inline">{fieldErrors.email}</span>}
                </div>
                <div className="edit-row">
                  <label>Telefon</label>
                  <PhoneInput
                    id="edit-phoneNumber"
                    value={form.phoneNumber}
                    onChange={(val) => setForm({ ...form, phoneNumber: val })}
                  />
                  {fieldErrors.phoneNumber && <span className="field-error-inline">{fieldErrors.phoneNumber}</span>}
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h4 className="detail-card__title">Rezervacija</h4>
              <div className="edit-fields">
                <div className="edit-row">
                  <label>Vozilo</label>
                  <div className="vehicle-picker-current">
                    <span className="booking-code-full">
                      {vehicleInfo?.registrationNumber || regFromList || form.vehicleCode}
                    </span>
                    <button
                      type="button"
                      className="side-btn vehicle-picker-btn"
                      onClick={handleLoadVehicles}
                      disabled={vehiclesLoading}
                    >
                      {vehiclesLoading ? "Učitavanje..." : "Promijeni vozilo"}
                    </button>
                  </div>
                  {vehiclesError && <span className="field-error-inline">{vehiclesError}</span>}
                  {fieldErrors.vehicleCode && <span className="field-error-inline">{fieldErrors.vehicleCode}</span>}
                  {showVehiclePicker && (
                    <div className="vehicle-picker-list">
                      {availableVehicles.length === 0 ? (
                        <p className="vehicle-picker-empty">Nema dostupnih vozila za odabrani period.</p>
                      ) : (
                        availableVehicles.map((v) => (
                          <div
                            key={v.vehicleCode}
                            className={`vehicle-picker-item${
                              v.vehicleCode === form.vehicleCode
                                ? " vehicle-picker-item--selected"
                                : ""
                            }${!v.isAvailable ? " vehicle-picker-item--unavailable" : ""}`}
                            onClick={() => v.isAvailable && handleSelectVehicle(v)}
                          >
                            <div className="vehicle-picker-item__main">
                              <strong>{v.registrationNumber}</strong>
                              {v.vehicleCode === reservation.vehicleCode && (
                                <span className="status-badge status--current">Trenutno</span>
                              )}
                              <span
                                className={`status-badge ${
                                  v.isAvailable ? "status--accepted" : "status--rejected"
                                }`}
                              >
                                {v.isAvailable ? "Dostupno" : "Zauzeto"}
                              </span>
                            </div>
                            {v.additionalEquipment &&
                              Object.keys(v.additionalEquipment).length > 0 && (
                                <div className="vehicle-picker-equipment">
                                  {Object.keys(v.additionalEquipment).join(", ")}
                                </div>
                              )}
                            {!v.isAvailable &&
                              Array.isArray(v.conflicts) &&
                              v.conflicts.map((c) => (
                                <div
                                  key={c.reservationId}
                                  className="vehicle-picker-conflict"
                                >
                                  <div>
                                    <strong>{c.customerName}</strong>
                                    {" · "}
                                    <span className={`status-badge ${STATUS_CLASSES[c.status] || ""}`}>
                                      {STATUS_LABELS[c.status] ?? c.status}
                                    </span>
                                  </div>
                                  <div>
                                    {formatSimpleDateTime(c.pickUpDateTime)} — {formatSimpleDateTime(c.dropOffDateTime)}
                                  </div>
                                  <a
                                    href={`/admin/rezervacije/${c.reservationId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="vehicle-picker-conflict__link"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {c.reservationCode}
                                  </a>
                                </div>
                              ))}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div className="edit-row">
                  <label>Status</label>
                  <select
                    id="edit-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: Number(e.target.value) })
                    }
                  >
                    {getStatusOptions(reservation.status).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="edit-row">
                  <label>Jezik</label>
                  <select
                    value={form.language}
                    onChange={(e) =>
                      setForm({ ...form, language: e.target.value })
                    }
                  >
                    <option value="me">Crnogorski</option>
                    <option value="en">English</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h4 className="detail-card__title">Preuzimanje</h4>
              <div className="edit-fields">
                <div className="edit-row">
                  <label>Lokacija</label>
                  <CityAutocomplete
                    id="editPickupLocation"
                    cities={cities}
                    value={form.pickupLocation}
                    onChange={(val) =>
                      setForm({ ...form, pickupLocation: val })
                    }
                    placeholder="Odaberi grad"
                  />
                  {fieldErrors.editPickupLocation && <span className="field-error-inline">{fieldErrors.editPickupLocation}</span>}
                </div>
                <div className="edit-row">
                  <label>Detalji lokacije</label>
                  <input
                    type="text"
                    value={form.pickUpAdditionalLocation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        pickUpAdditionalLocation: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="edit-row-pair">
                  <div className="edit-row">
                    <label>Datum</label>
                    <input
                      id="edit-pickupDate"
                      type="date"
                      value={form.pickupDate}
                      onChange={(e) =>
                        setForm({ ...form, pickupDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="edit-row">
                    <label>Vrijeme</label>
                    <select
                      value={form.pickupTime}
                      onChange={(e) =>
                        setForm({ ...form, pickupTime: e.target.value })
                      }
                    >
                      <option value="">—</option>
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {fieldErrors.pickupDate && <span className="field-error-inline">{fieldErrors.pickupDate}</span>}
              </div>
            </div>

            <div className="detail-card">
              <h4 className="detail-card__title">Vraćanje</h4>
              <div className="edit-fields">
                <div className="edit-row">
                  <label>Lokacija</label>
                  <CityAutocomplete
                    id="editDropoffLocation"
                    cities={cities}
                    value={form.dropoffLocation}
                    onChange={(val) =>
                      setForm({ ...form, dropoffLocation: val })
                    }
                    placeholder="Odaberi grad"
                  />
                  {fieldErrors.editDropoffLocation && <span className="field-error-inline">{fieldErrors.editDropoffLocation}</span>}
                </div>
                <div className="edit-row">
                  <label>Detalji lokacije</label>
                  <input
                    type="text"
                    value={form.dropOffAdditionalLocation}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dropOffAdditionalLocation: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="edit-row-pair">
                  <div className="edit-row">
                    <label>Datum</label>
                    <input
                      id="edit-dropoffDate"
                      type="date"
                      value={form.dropoffDate}
                      onChange={(e) =>
                        setForm({ ...form, dropoffDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="edit-row">
                    <label>Vrijeme</label>
                    <select
                      value={form.dropoffTime}
                      onChange={(e) =>
                        setForm({ ...form, dropoffTime: e.target.value })
                      }
                    >
                      <option value="">—</option>
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {fieldErrors.dropoffDate && <span className="field-error-inline">{fieldErrors.dropoffDate}</span>}
              </div>
            </div>
          </div>

          {availableExtras.length > 0 && (
            <div className="detail-card detail-card--full">
              <h4 className="detail-card__title">Dodaci</h4>
              <div className="reservation-extras">
                {availableExtras.map((item) => (
                  <label key={item.code} className="reservation-extras__item">
                    <input
                      type="checkbox"
                      checked={form.reservationItems.includes(item.code)}
                      onChange={() => handleExtraToggle(item.code)}
                    />
                    <span>{ITEM_LABELS[item.code] || item.code}</span>
                    <span className="reservation-extras__price">
                      {item.price}€
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {saveError && <p className="alert-error">{saveError}</p>}
          <div className="reservation-edit-actions">
            <button
              className="side-btn admin-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Čuvanje..." : "Sačuvaj"}
            </button>
            <button
              className="side-btn admin-cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              Otkaži
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="reservation-detail__grid">
            <div className="detail-card">
              <h4 className="detail-card__title">Gost</h4>
              <dl className="detail-list">
                <dt>Ime i prezime</dt>
                <dd>
                  {r.firstName} {r.lastName}
                </dd>
                <dt>Email</dt>
                <dd>{r.email}</dd>
                <dt>Telefon</dt>
                <dd>{r.phoneNumber}</dd>
              </dl>
            </div>

            <div className="detail-card">
              <h4 className="detail-card__title">Vozilo</h4>
              <dl className="detail-list">
                {carInfo?.vehicleName && (
                  <>
                    <dt>Naziv</dt>
                    <dd><strong>{carInfo.vehicleName}</strong>{carInfo.yearOfManufacture ? ` (${carInfo.yearOfManufacture})` : ""}</dd>
                  </>
                )}
                <dt>Reg. broj</dt>
                <dd>{vehicleInfo?.registrationNumber || regFromList || "—"}</dd>
                <dt>Kod vozila</dt>
                <dd className="booking-code-full">{r.vehicleCode || "—"}</dd>
                {carInfo?.colorItem && (
                  <>
                    <dt>Boja</dt>
                    <dd>{carInfo.colorItem}</dd>
                  </>
                )}
                {carInfo?.transmissionType && (
                  <>
                    <dt>Mjenjač</dt>
                    <dd>{carInfo.transmissionType === "A" ? "Automatik" : carInfo.transmissionType === "M" ? "Manuelni" : carInfo.transmissionType}</dd>
                  </>
                )}
                {carInfo?.fuelType && (
                  <>
                    <dt>Gorivo</dt>
                    <dd>{carInfo.fuelType === "D" ? "Dizel" : carInfo.fuelType === "P" ? "Benzin" : carInfo.fuelType === "H" ? "Hibrid" : carInfo.fuelType}</dd>
                  </>
                )}
              </dl>
            </div>

            <div className="detail-card">
              <h4 className="detail-card__title">Rezervacija</h4>
              <dl className="detail-list">
                <dt>Booking kod</dt>
                <dd className="booking-code-full">
                  {r.reservationCode || "—"}
                </dd>
              </dl>
            </div>

            <div className="detail-card">
              <h4 className="detail-card__title">Preuzimanje</h4>
              <dl className="detail-list">
                <dt>Lokacija</dt>
                <dd>{r.pickUpLocationName || "—"}</dd>
                {r.pickUpAdditionalLocation && (
                  <>
                    <dt>Detalji</dt>
                    <dd>{r.pickUpAdditionalLocation}</dd>
                  </>
                )}
                <dt>Datum i vrijeme</dt>
                <dd>{formatDateTime(r.carPickUpDateTime)}</dd>
              </dl>
            </div>

            <div className="detail-card">
              <h4 className="detail-card__title">Vraćanje</h4>
              <dl className="detail-list">
                <dt>Lokacija</dt>
                <dd>{r.dropOffLocationName || "—"}</dd>
                {r.dropOffAdditionalLocation && (
                  <>
                    <dt>Detalji</dt>
                    <dd>{r.dropOffAdditionalLocation}</dd>
                  </>
                )}
                <dt>Datum i vrijeme</dt>
                <dd>{formatDateTime(r.carDropOffDateTime)}</dd>
              </dl>
            </div>
          </div>

          {itemsPrices.length > 0 && (
            <div className="detail-card detail-card--full">
              <h4 className="detail-card__title">Stavke cijene</h4>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Stavka</th>
                    <th style={{ textAlign: "right" }}>Cijena</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsPrices.map((item) => (
                    <tr key={item.code}>
                      <td>{ITEM_LABELS[item.code] || item.code}</td>
                      <td style={{ textAlign: "right" }}>{item.price} €</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>
                      <strong>Ukupno</strong>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <strong>{r.priceTotal} €</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
