"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { adminCreateReservation } from "@/lib/adminApi";
import { fetchCities, fetchReservationItems } from "@/lib/inventoryApi";
import { INVENTORY_API_ROOT, getInventoryApiHeaders } from "@/lib/inventoryApi";
import CityAutocomplete from "@/components/common/CityAutocomplete";
import PhoneInput from "@/components/common/PhoneInput";
import VehicleSelector from "./VehicleSelector";
import TIME_OPTIONS from "@/lib/timeOptions";

const VALIDATION_MESSAGES = {
  "reservation.pick_up_date.must_be_future": "Datum preuzimanja mora biti u budućnosti.",
  "reservation.drop_off_date.must_be_after_pick_up": "Datum vraćanja mora biti poslije datuma preuzimanja.",
  "reservation.phone_number.invalid": "Neispravan format broja telefona (npr. +382XX123456).",
  "reservation.email.invalid": "Neispravna email adresa.",
  "reservation.first_name.required": "Ime je obavezno.",
  "reservation.last_name.required": "Prezime je obavezno.",
  "reservation.pick_up_location_id.required": "Lokacija preuzimanja je obavezna.",
  "reservation.drop_off_location_id.required": "Lokacija vraćanja je obavezna.",
  "reservation.pick_up_additional_location.required": "Detalji lokacije preuzimanja su obavezni.",
  "reservation.drop_off_additional_location.required": "Detalji lokacije vraćanja su obavezni.",
  "car_price.pick_up_location_id.required": "Lokacija preuzimanja je obavezna.",
  "car_price.drop_off_location_id.required": "Lokacija vraćanja je obavezna.",
  "This value should not be blank.": "Ovo polje je obavezno.",
};

const DOMAIN_ERRORS = {
  "car_instance.not_found.by_code": "Vozilo nije pronađeno.",
  "vehicle.not_available.for_period": "Vozilo nije dostupno za odabrani period.",
  "vehicle.not_available.no_alternative": "Nijedno dostupno vozilo za odabrani period.",
  "vehicle.already_booked": "Vozilo je upravo rezervisano. Pokušajte ponovo.",
  "car_price.not_found.for_period": "Nema cijena za odabrani period.",
  "car_price.not_found.for_car": "Cijene nisu konfigurisane za ovo vozilo.",
  "car_price.gap.non_contiguous_ranges": "Cijene su nepotpune za odabrani period.",
  "price_tier.not_found.for_duration": "Nema cijena za ovo trajanje najma.",
  "date_range.drop_off_before_pick_up": "Datum vraćanja mora biti poslije datuma preuzimanja.",
  "date_range.ending_before_starting": "Krajnji datum mora biti poslije početnog datuma.",
  "date_range.starting_after_ending": "Početni datum mora biti prije krajnjeg datuma.",
  "Starting date must be before ending date.": "Početni datum mora biti prije krajnjeg datuma.",
  "reservation.negative_total_price": "Greška u obračunu cijene.",
  "reservation.missing_name": "Ime i prezime su obavezni.",
  "reservation.missing_email": "Email je obavezan.",
  "reservation.missing_phone_number": "Broj telefona je obavezan.",
  "reservation.invalid_status": "Nevažeći status.",
};

const FIELD_MAP = {
  vehicleCode: "vehicleCode",
  carPickUpDateTime: "pickupDate",
  carDropOffDateTime: "dropoffDate",
  pickUpLocationId: "pickupLocation",
  dropOffLocationId: "dropoffLocation",
  pickUpAdditionalLocation: "pickUpAdditionalLocation",
  dropOffAdditionalLocation: "dropOffAdditionalLocation",
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  phoneNumber: "phoneNumber",
  code: "vehicleCode",
  startingDate: "pickupDate",
  endingDate: "dropoffDate",
};

const ITEM_LABELS = {
  days: "Najam",
  seat: "Dječije sjedište",
  booster: "Booster sjedište",
  border_cross: "Prelazak granice",
  city_deliver: "Dostava na preuzimanje",
  city_drop_off: "Dostava na vraćanje",
};

const formatPrice = (amount) => {
  if (amount == null) return "—";
  const n = Number(amount);
  return Number.isFinite(n) ? (n % 1 === 0 ? `${n} €` : `${n.toFixed(2)} €`) : "—";
};

export default function AdminReservationForm() {
  const router = useRouter();
  const alertRef = useRef(null);
  const [cities, setCities] = useState([]);
  const [availableExtras, setAvailableExtras] = useState([]);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [priceResult, setPriceResult] = useState(null);
  const [priceChecked, setPriceChecked] = useState(false);

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
    language: "me",
    reservationItems: [],
  });

  useEffect(() => {
    fetchCities().then(setCities).catch(() => setCities([]));
    fetchReservationItems().then(setAvailableExtras).catch(() => setAvailableExtras([]));
  }, []);

  // Reset price check kad se promijene relevantna polja
  useEffect(() => {
    setPriceChecked(false);
    setPriceResult(null);
  }, [
    form.vehicleCode, form.pickupDate, form.pickupTime,
    form.dropoffDate, form.dropoffTime, form.pickupLocation,
    form.dropoffLocation, form.reservationItems,
  ]);

  const handleExtraToggle = (code) => {
    setForm((prev) => ({
      ...prev,
      reservationItems: prev.reservationItems.includes(code)
        ? prev.reservationItems.filter((c) => c !== code)
        : [...prev.reservationItems, code],
    }));
  };

  const resolveError = (err) => {
    const p = err?.payload;
    if (p?.messageCode === "validation.failed" && Array.isArray(p?.parameters)) {
      const errors = {};
      for (const param of p.parameters) {
        const field = FIELD_MAP[param.field] || param.field;
        errors[field] = VALIDATION_MESSAGES[param.message] || param.message;
      }
      setFieldErrors(errors);
      const firstField = Object.keys(errors)[0];
      if (firstField) {
        const el = document.getElementById(`new-${firstField}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }
      return "Provjerite formu i ispravite greške.";
    }
    return DOMAIN_ERRORS[p?.messageCode] || p?.messageCode || err?.message || "Greška.";
  };

  const handleCheckPrice = async () => {
    setChecking(true);
    setError("");
    setFieldErrors({});
    setPriceResult(null);

    const pickUpLocationId = cities.find((c) => c.name === form.pickupLocation)?.id || null;
    const dropOffLocationId = cities.find((c) => c.name === form.dropoffLocation)?.id || null;

    if (!form.vehicleCode || !form.pickupDate || !form.pickupTime || !form.dropoffDate || !form.dropoffTime) {
      setError("Popunite vozilo, datume i vremena preuzimanja i vraćanja.");
      setChecking(false);
      return;
    }

    try {
      const response = await fetch("/api/car-price/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.vehicleCode,
          startingDate: `${form.pickupDate} ${form.pickupTime}`,
          endingDate: `${form.dropoffDate} ${form.dropoffTime}`,
          pickUpLocationId,
          dropOffLocationId,
          reservationItems: form.reservationItems,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        const code = payload?.messageCode;
        if (code === "validation.failed" && Array.isArray(payload?.parameters)) {
          const errors = {};
          for (const param of payload.parameters) {
            const field = FIELD_MAP[param.field] || param.field;
            errors[field] = VALIDATION_MESSAGES[param.message] || param.message;
          }
          setFieldErrors(errors);
          setError("Provjerite formu i ispravite greške.");
        } else {
          setError(DOMAIN_ERRORS[code] || code || payload?.message || "Greška pri provjeri cijene.");
        }
        return;
      }
      const data = payload?.data || payload;
      setPriceResult(data);
      setPriceChecked(true);
    } catch (err) {
      setError(err?.message || "Greška pri provjeri cijene.");
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!priceChecked) {
      setError("Potrebno je prvo provjeriti cijenu i raspoloživost.");
      return;
    }

    setSaving(true);
    setError("");
    setFieldErrors({});

    const pickUpLocationId = cities.find((c) => c.name === form.pickupLocation)?.id || null;
    const dropOffLocationId = cities.find((c) => c.name === form.dropoffLocation)?.id || null;

    try {
      const result = await adminCreateReservation({
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
        reservationItems: form.reservationItems,
        language: form.language,
      });
      const newId = result?.id;
      router.push(newId ? `/admin/rezervacije/${newId}` : "/admin/rezervacije");
    } catch (err) {
      setError(resolveError(err));
      setTimeout(() => alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } finally {
      setSaving(false);
    }
  };

  const renderFieldError = (field) =>
    fieldErrors[field] ? <span className="field-error-inline">{fieldErrors[field]}</span> : null;

  const priceItems = priceResult?.reservationItemsPrices
    ? Array.isArray(priceResult.reservationItemsPrices)
      ? priceResult.reservationItemsPrices
      : Object.entries(priceResult.reservationItemsPrices).map(([code, price]) => ({ code, price }))
    : [];

  return (
    <form className="reservation-edit-form" onSubmit={handleSubmit}>
      <div className="reservation-detail__grid">
        <div className="detail-card">
          <h4 className="detail-card__title">Vozilo i period</h4>
          <div className="edit-fields">
            <div className="edit-row">
              <label>Vozilo</label>
              <VehicleSelector
                value={form.vehicleCode}
                onSelect={(code) => setForm({ ...form, vehicleCode: code })}
              />
              {renderFieldError("vehicleCode")}
            </div>
          </div>
        </div>

        <div className="detail-card">
          <h4 className="detail-card__title">Postavke</h4>
          <div className="edit-fields">
            <div className="edit-row">
              <label>Jezik</label>
              <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
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
              <CityAutocomplete id="new-pickupLocation" cities={cities} value={form.pickupLocation}
                onChange={(val) => setForm({ ...form, pickupLocation: val })} placeholder="Odaberi grad" required />
              {renderFieldError("pickupLocation")}
            </div>
            <div className="edit-row">
              <label>Detalji lokacije</label>
              <input id="new-pickUpAdditionalLocation" type="text" value={form.pickUpAdditionalLocation}
                onChange={(e) => setForm({ ...form, pickUpAdditionalLocation: e.target.value })} />
              {renderFieldError("pickUpAdditionalLocation")}
            </div>
            <div className="edit-row-pair">
              <div className="edit-row">
                <label>Datum</label>
                <input id="new-pickupDate" type="date" required value={form.pickupDate}
                  onChange={(e) => setForm({ ...form, pickupDate: e.target.value })} />
              </div>
              <div className="edit-row">
                <label>Vrijeme</label>
                <select required value={form.pickupTime} onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}>
                  <option value="">—</option>
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {renderFieldError("pickupDate")}
          </div>
        </div>

        <div className="detail-card">
          <h4 className="detail-card__title">Vraćanje</h4>
          <div className="edit-fields">
            <div className="edit-row">
              <label>Lokacija</label>
              <CityAutocomplete id="new-dropoffLocation" cities={cities} value={form.dropoffLocation}
                onChange={(val) => setForm({ ...form, dropoffLocation: val })} placeholder="Odaberi grad" required />
              {renderFieldError("dropoffLocation")}
            </div>
            <div className="edit-row">
              <label>Detalji lokacije</label>
              <input id="new-dropOffAdditionalLocation" type="text" value={form.dropOffAdditionalLocation}
                onChange={(e) => setForm({ ...form, dropOffAdditionalLocation: e.target.value })} />
              {renderFieldError("dropOffAdditionalLocation")}
            </div>
            <div className="edit-row-pair">
              <div className="edit-row">
                <label>Datum</label>
                <input id="new-dropoffDate" type="date" required value={form.dropoffDate}
                  onChange={(e) => setForm({ ...form, dropoffDate: e.target.value })} />
              </div>
              <div className="edit-row">
                <label>Vrijeme</label>
                <select required value={form.dropoffTime} onChange={(e) => setForm({ ...form, dropoffTime: e.target.value })}>
                  <option value="">—</option>
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            {renderFieldError("dropoffDate")}
          </div>
        </div>
      </div>

      {availableExtras.length > 0 && (
        <div className="detail-card detail-card--full">
          <h4 className="detail-card__title">Dodaci</h4>
          <div className="reservation-extras">
            {availableExtras.map((item) => (
              <label key={item.code} className="reservation-extras__item">
                <input type="checkbox" checked={form.reservationItems.includes(item.code)}
                  onChange={() => handleExtraToggle(item.code)} />
                <span>{ITEM_LABELS[item.code] || item.code}</span>
                <span className="reservation-extras__price">{item.price}€</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {!priceChecked && (
        <>
        <div ref={alertRef}>
          {error && <p className="alert-error">{error}</p>}
        </div>
        <div className="reservation-edit-actions">
          <button type="button" className="side-btn admin-save-btn" onClick={handleCheckPrice} disabled={checking}>
            {checking ? "Provjeravanje..." : "Provjeri cijenu i raspoloživost"}
          </button>
          <button type="button" className="side-btn admin-cancel-btn" disabled={checking}
            onClick={() => router.push("/admin/rezervacije")}>
            Nazad
          </button>
        </div>
        </>
      )}

      {priceChecked && priceResult && (
        <>
          <div className="detail-card detail-card--full">
            <h4 className="detail-card__title">Obračun cijene</h4>
            <div className="price-breakdown">
              {priceItems.map((item) => (
                <div key={item.code} className="price-breakdown__row">
                  <span>{ITEM_LABELS[item.code] || item.code}</span>
                  <span>{formatPrice(item.price)}</span>
                </div>
              ))}
              <div className="price-breakdown__total">
                <span>Ukupno</span>
                <span>{formatPrice(priceResult.totalPrice)}</span>
              </div>
            </div>
          </div>

          <div className="detail-card detail-card--full">
            <h4 className="detail-card__title">Podaci o gostu</h4>
            <div className="edit-fields">
              <div className="edit-row-pair">
                <div className="edit-row">
                  <label>Ime</label>
                  <input id="new-firstName" type="text" required value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  {renderFieldError("firstName")}
                </div>
                <div className="edit-row">
                  <label>Prezime</label>
                  <input id="new-lastName" type="text" required value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                  {renderFieldError("lastName")}
                </div>
              </div>
              <div className="edit-row-pair">
                <div className="edit-row">
                  <label>Email</label>
                  <input id="new-email" type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  {renderFieldError("email")}
                </div>
                <div className="edit-row">
                  <label>Telefon</label>
                  <PhoneInput id="new-phoneNumber" required value={form.phoneNumber}
                    onChange={(val) => setForm({ ...form, phoneNumber: val })} />
                  {renderFieldError("phoneNumber")}
                </div>
              </div>
            </div>
          </div>

          <div ref={alertRef}>
            {error && <p className="alert-error">{error}</p>}
          </div>
          <div className="reservation-edit-actions">
            <button type="submit" className="side-btn admin-save-btn" disabled={saving}>
              {saving ? "Kreiranje..." : "Kreiraj rezervaciju"}
            </button>
            <button type="button" className="side-btn admin-cancel-btn" disabled={saving}
              onClick={() => router.push("/admin/rezervacije")}>
              Nazad
            </button>
          </div>
        </>
      )}
    </form>
  );
}
