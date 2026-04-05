"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "./Sidebar";
import Pagination from "../common/Pagination";
import { adminGetReservations, adminLogout } from "@/lib/adminApi";

const STATUS_LABELS = {
  0: "Na čekanju",
  1: "Odbijena",
  2: "Prihvaćena",
};

const STATUS_CLASSES = {
  0: "status--pending",
  1: "status--rejected",
  2: "status--accepted",
};

const formatDate = (dateObj) => {
  if (!dateObj) return "—";
  const raw = dateObj?.date || dateObj;
  if (typeof raw !== "string") return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("sr-Latn-ME", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ITEMS_PER_PAGE = 10;

export default function Reservations() {
  const router = useRouter();
  const [reservations, setReservations] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    let aborted = false;
    adminGetReservations({
      page,
      limit: ITEMS_PER_PAGE,
      registrationNumber: search || undefined,
      signal: controller.signal,
    })
      .then((payload) => {
        setReservations(payload?.data || []);
        setMeta(payload?.meta || null);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") {
          aborted = true;
          return;
        }
        if (err?.status === 401) {
          adminLogout().then(() => router.push("/admin"));
          return;
        }
        setError(err?.message || "Greška pri učitavanju rezervacija.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [page, search, router]);

  const totalPages = meta?.totalPages || 1;

  return (
    <section className="dashboard-widget">
      <div className="right-box">
        <Sidebar />
        <div className="content-column">
          <div className="inner-column">
            <div className="list-title header-with-action">
              <h3 className="title">Rezervacije</h3>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Pretraži po reg. broju..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <Link href="/admin/rezervacije/nova" className="admin-add-btn">
                + Nova rezervacija
              </Link>
              </div>
            </div>

            {error && <p className="alert-error">{error}</p>}

            {loading ? (
              <p className="text">Učitavanje rezervacija...</p>
            ) : reservations.length === 0 ? (
              <p className="text">Nema rezervacija.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table reservations-table">
                  <thead>
                    <tr>
                      <th>Kod</th>
                      <th>Gost</th>
                      <th>Reg. broj</th>
                      <th>Preuzimanje</th>
                      <th>Vraćanje</th>
                      <th>Cijena</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => (
                      <tr
                        key={r.id}
                        className="clickable-row"
                        onClick={() => router.push(`/admin/rezervacije/${r.id}?reg=${encodeURIComponent(r.registrationNumber || "")}`)}
                      >
                        <td className="booking-code">
                          {r.bookingCode || "—"}
                        </td>
                        <td>
                          <div>{r.reservationHolderName || "—"}</div>
                          <div className="small-text">
                            {r.reservationHolderEmail || ""}
                          </div>
                          <div className="small-text">
                            {r.reservationHolderPhoneNumber || ""}
                          </div>
                        </td>
                        <td>{r.registrationNumber || "—"}</td>
                        <td>{formatDate(r.fromDate)}</td>
                        <td>{formatDate(r.toDate)}</td>
                        <td className="price-cell">
                          {r.totalPrice != null ? `${r.totalPrice} €` : "—"}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${STATUS_CLASSES[r.status] || ""}`}
                          >
                            {STATUS_LABELS[r.status] ?? r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination-box">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
