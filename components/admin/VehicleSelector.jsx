"use client";
import React, { useEffect, useState } from "react";
import { adminGetCars } from "@/lib/adminApi";
import { normalizeInventoryImageUrl } from "@/lib/inventoryApi";

const resolveCarCover = (car) => {
  const imgs = car?.generatedImages || [];
  const cover = imgs.find((i) => i?.type === "c");
  const path = cover?.path || car?.coverImage || car?.image;
  return path ? normalizeInventoryImageUrl(path) : null;
};

export default function VehicleSelector({ value, onSelect }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const loadCars = async () => {
    if (cars.length > 0) {
      setOpen(true);
      return;
    }
    setLoading(true);
    try {
      const payload = await adminGetCars({ limit: 100 });
      setCars(payload?.data || []);
      setOpen(true);
    } catch {
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const allInstances = cars.flatMap((car) =>
    (car.instances || []).map((inst) => ({
      vehicleCode: inst.code || inst.uuid,
      registrationNumber: inst.registrationNumber,
      carName: car.vehicleName || car.name,
      year: car.yearOfManufacture || car.manufactureYear,
      coverImage: resolveCarCover(car),
      transmission: car.transmissionType,
      fuel: car.fuelType,
      isDeleted: inst.isDeleted,
    }))
  ).filter((inst) => !inst.isDeleted);

  const filtered = search
    ? allInstances.filter(
        (inst) =>
          inst.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
          inst.carName?.toLowerCase().includes(search.toLowerCase()) ||
          inst.vehicleCode?.toLowerCase().includes(search.toLowerCase())
      )
    : allInstances;

  const selectedInst = allInstances.find((i) => i.vehicleCode === value);

  return (
    <div className="vehicle-selector">
      {selectedInst && (
        <div className="vehicle-selector__selected">
          {selectedInst.coverImage && (
            <img src={selectedInst.coverImage} alt="" className="vehicle-selector__thumb" />
          )}
          <div>
            <strong>{selectedInst.carName} ({selectedInst.year})</strong>
            <div className="small-text">{selectedInst.registrationNumber}</div>
          </div>
        </div>
      )}
      <button
        type="button"
        className="side-btn vehicle-picker-btn"
        onClick={loadCars}
        disabled={loading}
      >
        {loading ? "Učitavanje..." : selectedInst ? "Promijeni vozilo" : "Odaberi vozilo"}
      </button>

      {open && (
        <div className="vehicle-selector__dropdown">
          <div className="vehicle-selector__search">
            <input
              type="text"
              placeholder="Pretraži po imenu ili reg. broju..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="vehicle-selector__list">
            {filtered.length === 0 ? (
              <p className="vehicle-picker-empty">Nema rezultata.</p>
            ) : (
              filtered.map((inst) => (
                <div
                  key={inst.vehicleCode}
                  className={`vehicle-selector__item${
                    inst.vehicleCode === value ? " vehicle-selector__item--selected" : ""
                  }`}
                  onClick={() => {
                    onSelect(inst.vehicleCode);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {inst.coverImage ? (
                    <img src={inst.coverImage} alt="" className="vehicle-selector__thumb" />
                  ) : (
                    <div className="vehicle-selector__thumb vehicle-selector__thumb--empty">—</div>
                  )}
                  <div className="vehicle-selector__info">
                    <strong>{inst.carName}</strong>
                    <span className="small-text">{inst.year}</span>
                  </div>
                  <div className="vehicle-selector__meta">
                    <span className="vehicle-selector__reg">{inst.registrationNumber}</span>
                    <span className="small-text">{inst.vehicleCode.slice(0, 8)}…</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            type="button"
            className="vehicle-selector__close"
            onClick={() => { setOpen(false); setSearch(""); }}
          >
            Zatvori
          </button>
        </div>
      )}
    </div>
  );
}
