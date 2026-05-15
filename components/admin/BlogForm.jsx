"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import nextDynamic from "next/dynamic";
import {
  adminGetBlog,
  adminCreateBlog,
  adminUpdateBlog,
  adminLogout,
} from "@/lib/adminApi";
import { normalizeInventoryImageUrl } from "@/lib/inventoryApi";
import { parseTocFromHtml, injectHeadingIds } from "@/lib/tocUtils";

const ReactQuill = nextDynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p className="text">Učitavanje editora...</p>,
});
import "react-quill-new/dist/quill.snow.css";

const VALIDATION_MESSAGES = {
  "blog.title.required": "Naslov je obavezan.",
  "blog.title.max_length": "Naslov je predugačak.",
  "blog.description.required": "Kratak opis je obavezan.",
  "blog.description.max_length": "Kratak opis je predugačak.",
  "blog.content.required": "Sadržaj je obavezan.",
  "blog.meta_description.max_length": "Meta opis je predugačak.",
  "blog.meta_description.required": "Meta opis je obavezan.",
  "blog.language.required": "Jezik je obavezan.",
  "blog.language.invalid": "Nevažeći jezik.",
  "blog.cover_image.required": "Naslovna slika je obavezna.",
  "blog.cover_image.invalid_type": "Nevažeći format slike.",
  "blog.cover_image.max_size": "Slika je prevelika.",
  "This value should not be blank.": "Ovo polje je obavezno.",
};

const FIELD_MAP = {
  title: "title",
  description: "description",
  content: "content",
  metaDescription: "metaDescription",
  language: "language",
  coverImage: "coverImage",
  isPublished: "isPublished",
};

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "link", "image"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const TOC_LABEL = { me: "Sadržaj", en: "Table of Contents", ru: "Содержание" };

function FieldHint({ text }) {
  return (
    <span className="field-hint">
      ?
      <span className="field-hint__tooltip">{text}</span>
    </span>
  );
}

// Replace &nbsp; injected by Quill's justify alignment with regular spaces
function cleanQuillHtml(html) {
  if (!html) return html;
  return html.replace(/&nbsp;/g, " ").replace(/  +/g, " ");
}

async function formatHtml(html) {
  if (!html) return html;
  const mod = await import("js-beautify");
  const beautify = mod.html ?? mod.default?.html;
  return beautify(html, {
    indent_size: 2,
    wrap_line_length: 0,
    preserve_newlines: false,
    end_with_newline: false,
    extra_liners: [],
  });
}

export default function BlogForm({ blogId }) {
  const router = useRouter();
  const isEdit = Boolean(blogId);
  const fileInputRef = useRef(null);
  const alertRef = useRef(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [existingImage, setExistingImage] = useState("");
  const [editorTab, setEditorTab] = useState("visual");
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    language: "me",
    isPublished: false,
    metaDescription: "",
    coverImage: null,
  });

  useEffect(() => {
    if (!isEdit) return;
    const controller = new AbortController();
    adminGetBlog(blogId, { signal: controller.signal })
      .then((data) => {
        setForm({
          title: data.title || "",
          description: data.description || "",
          content: cleanQuillHtml(data.content || ""),
          language: data.language || "me",
          isPublished: Boolean(data.isPublished),
          metaDescription: data.metaDescription || "",
          coverImage: null,
        });
        setExistingImage(data.generatedCoverImage || "");
        setLoading(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        if (err?.status === 401) {
          adminLogout().then(() => router.push("/admin"));
          return;
        }
        setError(err?.message || "Greška pri učitavanju bloga.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [blogId, isEdit, router]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const resolveError = (err) => {
    const p = err?.payload;
    const errors = {};

    if (p?.messageCode === "validation.failed" && Array.isArray(p?.parameters)) {
      for (const param of p.parameters) {
        const field = FIELD_MAP[param.field] || param.field;
        errors[field] = VALIDATION_MESSAGES[param.message] || param.message;
      }
    }

    if (!Object.keys(errors).length && Array.isArray(p?.violations)) {
      for (const v of p.violations) {
        const field = FIELD_MAP[v.propertyPath] || v.propertyPath;
        if (field) {
          errors[field] = VALIDATION_MESSAGES[v.message] || v.message;
        }
      }
    }

    if (!Object.keys(errors).length && err?.validationErrors) {
      for (const [key, msg] of Object.entries(err.validationErrors)) {
        const field = FIELD_MAP[key] || key;
        errors[field] = VALIDATION_MESSAGES[msg] || msg;
      }
    }

    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      const firstField = Object.keys(errors)[0];
      if (firstField) {
        const el = document.getElementById(`blog-${firstField}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      }
      return "Provjerite formu i ispravite greške.";
    }

    return p?.message || p?.detail || err?.message || "Greška pri čuvanju bloga.";
  };

  const renderFieldError = (field) =>
    fieldErrors[field] ? <span className="field-error-inline">{fieldErrors[field]}</span> : null;

  const stripHtml = (html) => html?.replace(/<[^>]*>/g, "").trim() || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    const localErrors = {};
    if (!form.title.trim()) localErrors.title = VALIDATION_MESSAGES["blog.title.required"];
    if (!form.description.trim()) localErrors.description = VALIDATION_MESSAGES["blog.description.required"];
    if (!stripHtml(form.content)) localErrors.content = VALIDATION_MESSAGES["blog.content.required"];
    if (!form.metaDescription.trim()) localErrors.metaDescription = VALIDATION_MESSAGES["blog.meta_description.required"];
    if (!isEdit && !form.coverImage && !existingImage) localErrors.coverImage = VALIDATION_MESSAGES["blog.cover_image.required"];

    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      setError("Provjerite formu i ispravite greške.");
      setTimeout(() => {
        const firstField = Object.keys(localErrors)[0];
        const el = document.getElementById(`blog-${firstField}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        } else {
          alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      return;
    }

    setSaving(true);

    const cleanedForm = { ...form, content: cleanQuillHtml(form.content) };

    try {
      if (isEdit) {
        await adminUpdateBlog(blogId, cleanedForm);
        setSuccess("Blog je uspješno ažuriran.");
        setTimeout(() => alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
      } else {
        const created = await adminCreateBlog(cleanedForm);
        setSuccess("Blog je uspješno kreiran.");
        router.push(`/admin/blogovi/${created.id}`);
        return;
      }
    } catch (err) {
      setError(resolveError(err));
      setTimeout(() => alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text">Učitavanje...</p>;

  const imagePreview = form.coverImage
    ? URL.createObjectURL(form.coverImage)
    : existingImage
    ? normalizeInventoryImageUrl(existingImage)
    : null;

  const contentForPreview = cleanQuillHtml(form.content);
  const previewToc = parseTocFromHtml(contentForPreview);
  const previewContent = injectHeadingIds(contentForPreview);

  return (
    <form className="blog-form" onSubmit={handleSubmit}>
      <div className="blog-form__grid">
        <div className="blog-form__main">
          <div className="detail-card">
            <h4 className="detail-card__title">Sadržaj</h4>
            <div className="edit-fields">
              <div className="edit-row">
                <label>
                  Naslov
                  <FieldHint text="Glavni naslov bloga koji se prikazuje na stranici, u listi blogova i u Google pretrazi." />
                </label>
                <input
                  id="blog-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
                {renderFieldError("title")}
              </div>
              <div className="edit-row">
                <label>
                  Kratak opis
                  <FieldHint text="Jedna ili dvije rečenice koje opisuju blog. Prikazuje se na listi blogova ispod naslova." />
                </label>
                <textarea
                  id="blog-description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
                {renderFieldError("description")}
              </div>
              <div className="edit-row">
                <label>
                  Sadržaj
                  <FieldHint text="Glavni tekst bloga. Koristite H2 za glavne sekcije i H3 za podsekcije — automatski se generiše Table of Contents. Vizuelni editor je za pisanje, HTML tab za napredne izmjene, Preview za provjeru izgleda." />
                </label>
                <div id="blog-content" className="blog-editor-wrapper">
                  <div className="blog-editor-tabs">
                    <button
                      type="button"
                      className={`blog-editor-tab${editorTab === "visual" ? " active" : ""}`}
                      onClick={() => setEditorTab("visual")}
                    >
                      Vizuelni editor
                    </button>
                    <button
                      type="button"
                      className={`blog-editor-tab${editorTab === "html" ? " active" : ""}`}
                      onClick={async () => {
                        const cleaned = cleanQuillHtml(form.content);
                        const formatted = await formatHtml(cleaned);
                        handleChange("content", formatted);
                        setEditorTab("html");
                      }}
                    >
                      HTML kod
                    </button>
                    <button
                      type="button"
                      className={`blog-editor-tab${editorTab === "preview" ? " active" : ""}`}
                      onClick={() => setEditorTab("preview")}
                    >
                      Preview
                    </button>
                  </div>

                  {editorTab === "visual" && (
                    <ReactQuill
                      theme="snow"
                      value={form.content}
                      onChange={(value) => handleChange("content", value)}
                      modules={QUILL_MODULES}
                    />
                  )}

                  {editorTab === "html" && (
                    <>
                      <div className="blog-editor-html-actions">
                        <button
                          type="button"
                          className="blog-editor-format-btn"
                          onClick={async () => {
                            const formatted = await formatHtml(cleanQuillHtml(form.content));
                            handleChange("content", formatted);
                          }}
                        >
                          Formatiraj HTML
                        </button>
                      </div>
                      <textarea
                        className="blog-editor-html"
                        value={form.content}
                        onChange={(e) => handleChange("content", e.target.value)}
                        rows={20}
                        spellCheck={false}
                        placeholder="Unesite HTML kod ovdje..."
                      />
                    </>
                  )}

                  {editorTab === "preview" && (
                    <div className="blog-editor-preview">
                      <div className="blog-section-five">
                        <div className="blog-content">
                          {previewToc.length > 0 && (
                            <div className="blog-toc">
                              <h3>{TOC_LABEL[form.language] || "Table of Contents"}</h3>
                              <ol className="blog-list">
                                {previewToc.map((item) => (
                                  <li key={item.id}>
                                    <span>{item.label}</span>
                                    {item.children.length > 0 && (
                                      <ul className="blog-sublist">
                                        {item.children.map((child) => (
                                          <li key={child.id}><span>{child.label}</span></li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {form.content ? (
                            <div dangerouslySetInnerHTML={{ __html: previewContent }} />
                          ) : (
                            <p className="blog-editor-preview__empty">Nema sadržaja za prikaz.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {renderFieldError("content")}
              </div>
              <div className="edit-row">
                <label>
                  Meta opis (SEO)
                  <FieldHint text="Opis koji Google prikazuje u rezultatima pretrage. Idealno između 120 i 160 karaktera. Ne prikazuje se na samoj stranici bloga." />
                </label>
                <textarea
                  id="blog-metaDescription"
                  rows={2}
                  value={form.metaDescription}
                  onChange={(e) => handleChange("metaDescription", e.target.value)}
                />
                {renderFieldError("metaDescription")}
              </div>
            </div>
          </div>
        </div>

        <div className="blog-form__side">
          <div className="detail-card">
            <h4 className="detail-card__title">Postavke</h4>
            <div className="edit-fields">
              <div className="edit-row">
                <label>
                  Jezik
                  <FieldHint text="Jezik na kom je blog napisan. Određuje u kojoj jezičnoj verziji sajta će se blog prikazivati." />
                </label>
                <select
                  id="blog-language"
                  value={form.language}
                  onChange={(e) => handleChange("language", e.target.value)}
                >
                  <option value="me">Crnogorski</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </select>
                {renderFieldError("language")}
              </div>
              <div className="edit-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => handleChange("isPublished", e.target.checked)}
                  />
                  <span>Objavljeno</span>
                </label>
                <FieldHint text="Kada je uključeno, blog je vidljiv svim posjetiocima sajta. Isključeno znači da je blog sačuvan kao nacrt." />
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h4 className="detail-card__title">
              Naslovna slika
              <FieldHint text="Slika koja se prikazuje na vrhu bloga i kao thumbnail u listi blogova. Preporučena veličina: 924×450px." />
            </h4>
            {imagePreview && (
              <img src={imagePreview} alt="" className="blog-form__preview" />
            )}
            <button
              type="button"
              className="side-btn vehicle-picker-btn"
              onClick={() => fileInputRef.current?.click()}
              style={{ marginTop: "8px" }}
            >
              {imagePreview ? "Zamijeni sliku" : "Dodaj sliku"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleChange("coverImage", e.target.files?.[0] || null)}
            />
            {renderFieldError("coverImage")}
          </div>
        </div>
      </div>

      <div ref={alertRef}>
        {success && <p className="alert-success">{success}</p>}
        {error && <p className="alert-error">{error}</p>}
      </div>
      <div className="reservation-edit-actions">
        <button
          type="submit"
          className="side-btn admin-save-btn"
          disabled={saving}
        >
          {saving ? "Čuvanje..." : isEdit ? "Sačuvaj" : "Kreiraj blog"}
        </button>
        <button
          type="button"
          className="side-btn admin-cancel-btn"
          onClick={() => router.push("/admin/blogovi")}
          disabled={saving}
        >
          Nazad
        </button>
      </div>
    </form>
  );
}
