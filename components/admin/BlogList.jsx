"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "./Sidebar";
import Pagination from "../common/Pagination";
import { adminGetBlogs, adminDeleteBlog, adminLogout } from "@/lib/adminApi";
import { normalizeInventoryImageUrl } from "@/lib/inventoryApi";

const LANG_LABELS = { me: "MNE", en: "ENG", ru: "RUS" };
const ITEMS_PER_PAGE = 10;

const formatDate = (dateObj) => {
  if (!dateObj) return "—";
  const raw = dateObj?.date || dateObj;
  if (typeof raw !== "string") return "—";
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}.${match[2]}.${match[1]}.`;
  return "—";
};

export default function BlogList() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [langFilter, setLangFilter] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    adminGetBlogs({
      page,
      limit: ITEMS_PER_PAGE,
      language: langFilter || undefined,
      signal: controller.signal,
    })
      .then((payload) => {
        setBlogs(payload?.data || []);
        setMeta(payload?.meta || null);
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        if (err?.status === 401) {
          adminLogout().then(() => router.push("/admin"));
          return;
        }
        setError(err?.message || "Greška pri učitavanju blogova.");
        setLoading(false);
      });

    return () => controller.abort();
  }, [page, langFilter, router]);

  const handleDelete = async (id) => {
    try {
      await adminDeleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err?.message || "Greška pri brisanju bloga.");
      setDeleteConfirm(null);
    }
  };

  const totalPages = meta?.pages || meta?.totalPages || 1;

  return (
    <section className="dashboard-widget">
      <div className="right-box">
        <Sidebar />
        <div className="content-column">
          <div className="inner-column">
            <div className="list-title header-with-action">
              <h3 className="title">Blog</h3>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <select
                  value={langFilter}
                  onChange={(e) => { setLangFilter(e.target.value); setPage(1); }}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #d8deea", fontSize: "13px" }}
                >
                  <option value="">Svi jezici</option>
                  <option value="me">Crnogorski</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </select>
                <Link href="/admin/blogovi/novi" className="admin-add-btn">
                  + Novi blog
                </Link>
              </div>
            </div>

            {error && <p className="alert-error">{error}</p>}

            {loading ? (
              <p className="text">Učitavanje blogova...</p>
            ) : blogs.length === 0 ? (
              <p className="text">Nema blogova.</p>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Slika</th>
                      <th>Naslov</th>
                      <th>Jezik</th>
                      <th>Status</th>
                      <th>Datum</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((b) => (
                      <tr
                        key={b.id}
                        className="clickable-row"
                        onClick={() => router.push(`/admin/blogovi/${b.id}`)}
                      >
                        <td>
                          {b.generatedCoverImage ? (
                            <img
                              src={normalizeInventoryImageUrl(b.generatedCoverImage)}
                              alt=""
                              className="blog-table-thumb"
                            />
                          ) : (
                            <span className="blog-table-thumb blog-table-thumb--empty">—</span>
                          )}
                        </td>
                        <td>
                          <div className="blog-table-title">{b.title}</div>
                          <div className="small-text">{b.alias}</div>
                        </td>
                        <td>
                          <span className="status-badge status--current">
                            {LANG_LABELS[b.language] || b.language}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${b.isPublished ? "status--accepted" : "status--pending"}`}>
                            {b.isPublished ? "Objavljeno" : "Draft"}
                          </span>
                        </td>
                        <td>{formatDate(b.createdAt)}</td>
                        <td>
                          <button
                            className="blog-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(b.id);
                            }}
                          >
                            Obriši
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="pagination-box">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}

            {deleteConfirm && (
              <div className="confirm-overlay">
                <div className="confirm-box">
                  <p>Da li ste sigurni da želite obrisati ovaj blog?</p>
                  <div className="confirm-actions">
                    <button className="side-btn admin-save-btn" onClick={() => handleDelete(deleteConfirm)}>
                      Da, obriši
                    </button>
                    <button className="side-btn admin-cancel-btn" onClick={() => setDeleteConfirm(null)}>
                      Otkaži
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
