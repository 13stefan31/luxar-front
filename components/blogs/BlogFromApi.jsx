"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { fetchBlog, normalizeInventoryImageUrl } from "@/lib/inventoryApi";
import { parseTocFromHtml, injectHeadingIds } from "@/lib/tocUtils";

export default function BlogFromApi({ blogId, origin }) {
  const { t, locale } = useLanguage();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [embedCopyState, setEmbedCopyState] = useState("idle");
  const embedTextareaRef = useRef(null);
  const embedTriggerRef = useRef(null);

  const embedCode = useMemo(() => {
    if (!shareUrl) return "";
    const title = (blog?.title || "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    const url = shareUrl.replaceAll("&", "&amp;");
    return `<div style="position:relative;width:100%;padding-top:56.25%;overflow:hidden;border-radius:12px;">\n  <iframe src="${url}" title="${title}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>\n</div>`;
  }, [shareUrl, blog?.title]);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchBlog(blogId, locale)
      .then((data) => {
        setBlog(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || "Blog nije pronađen.");
        setLoading(false);
      });
  }, [blogId, locale]);

  useEffect(() => {
    if (typeof window !== "undefined") setShareUrl(window.location.href);
  }, []);

  const copyText = useCallback(async (text) => {
    if (!text) return false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {}
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }
  }, []);

  const handleCopyLink = useCallback(async () => {
    const didCopy = await copyText(shareUrl);
    if (didCopy) {
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    }
  }, [copyText, shareUrl]);

  const handleInstagramShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: blog?.title || "", url: shareUrl });
        return;
      } catch {}
    }
    await handleCopyLink();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }, [blog?.title, shareUrl, handleCopyLink]);

  const openEmbedModal = useCallback(() => setIsEmbedOpen(true), []);
  const closeEmbedModal = useCallback(() => {
    setIsEmbedOpen(false);
    embedTriggerRef.current?.focus();
  }, []);

  const handleCopyEmbed = useCallback(async () => {
    const didCopy = await copyText(embedCode);
    if (didCopy) {
      setEmbedCopyState("copied");
      window.setTimeout(() => setEmbedCopyState("idle"), 2000);
    }
  }, [copyText, embedCode]);

  useEffect(() => {
    if (!isEmbedOpen) return;
    const handleKeyDown = (e) => { if (e.key === "Escape") closeEmbedModal(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeEmbedModal, isEmbedOpen]);

  useEffect(() => {
    if (!isEmbedOpen) return;
    document.body.classList.add("embed-modal-open");
    embedTextareaRef.current?.focus();
    embedTextareaRef.current?.select();
    return () => document.body.classList.remove("embed-modal-open");
  }, [isEmbedOpen]);

  if (loading) {
    return (
      <section className="blog-section-single">
        <div className="boxcar-container">
          <p className="text">{t("Loading...")}</p>
        </div>
      </section>
    );
  }

  if (error || !blog) {
    return (
      <section className="blog-section-single">
        <div className="boxcar-container">
          <p className="text">{error || t("Blog not found.")}</p>
        </div>
      </section>
    );
  }

  const coverImage = blog.coverImagePath
    ? normalizeInventoryImageUrl(blog.coverImagePath)
    : blog.generatedCoverImage
    ? normalizeInventoryImageUrl(blog.generatedCoverImage)
    : null;

  const publishedDate = blog.publishedAt
    ? new Date(
        typeof blog.publishedAt === "string"
          ? blog.publishedAt
          : blog.publishedAt.date
      ).toLocaleDateString("sr-Latn-ME", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const shareTitle = blog.title || "";
  const facebookShareUrl = shareUrl
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    : "";
  const whatsappShareUrl = shareUrl
    ? `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`
    : "";

  const toc = parseTocFromHtml(blog.content);
  const contentWithIds = injectHeadingIds(blog.content);

  const shareButtons = (extraClass) => (
    <div className={`blog-share${extraClass ? ` ${extraClass}` : ""}`}>
      <span className="share-label">{t("Share this blog")}</span>
      <ul className="share-list">
        <li>
          <a href={facebookShareUrl} className="share-link" target="_blank" rel="noopener noreferrer" aria-label={t("Share on Facebook")}>
            <i className="fa-brands fa-facebook-f" />
            <span>{t("Facebook")}</span>
          </a>
        </li>
        <li>
          <button type="button" className="share-link share-button" onClick={handleInstagramShare} aria-label={t("Share on Instagram")}>
            <i className="fa-brands fa-instagram" />
            <span>{t("Instagram")}</span>
          </button>
        </li>
        <li>
          <a href={whatsappShareUrl} className="share-link" target="_blank" rel="noopener noreferrer" aria-label={t("Share on WhatsApp")}>
            <i className="fa-brands fa-whatsapp" />
            <span>{t("WhatsApp")}</span>
          </a>
        </li>
        <li>
          <button type="button" className="share-link share-button" onClick={handleCopyLink} aria-live="polite">
            <i className="fa-solid fa-link" />
            <span>{copyState === "copied" ? t("Copied") : t("Copy link")}</span>
          </button>
        </li>
        <li>
          <button type="button" className="share-link share-button" onClick={openEmbedModal} aria-label={t("Embed")} ref={embedTriggerRef}>
            <span className="code-icon" aria-hidden="true">{"</>"}</span>
            <span>{t("Embed")}</span>
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <section className="blog-section-five layout-radius">
      <div className="boxcar-container">
        <div className="boxcar-title wow fadeInUp">
          <ul className="breadcrumb">
            <li><Link href="/">{t("Home")}</Link></li>
            {origin === "services" ? (
              <li><span>{t("Locations")}</span></li>
            ) : (
              <li><Link href="/blog-list-01">{t("Blog")}</Link></li>
            )}
            <li><span>{blog.title}</span></li>
          </ul>
          {publishedDate && (
            <ul className="post-info">
              <li>{publishedDate}</li>
            </ul>
          )}
          <h2>{blog.title}</h2>
          {blog.description && (
            <div className="blog-subtitle">{blog.description}</div>
          )}
        </div>
      </div>
      <div className="right-box">
        <div className="large-container">
          <div className="content-box">
            <div className="right-box-two">
              <div className="image-sec">
                <div className="image-box">
                  {coverImage && (
                    <figure className="inner-image">
                      <Image alt={blog.title} width={924} height={450} src={coverImage} priority />
                    </figure>
                  )}
                </div>
                <div className="blog-content">
                  {shareButtons()}

                  {toc.length > 0 && (
                    <div className="blog-toc">
                      <h3>{t("Table of Contents")}</h3>
                      <ol className="blog-list">
                        {toc.map((item) => (
                          <li key={item.id}>
                            <a href={`#${item.id}`}>{item.label}</a>
                            {item.children.length > 0 && (
                              <ul className="blog-sublist">
                                {item.children.map((child) => (
                                  <li key={child.id}>
                                    <a href={`#${child.id}`}>{child.label}</a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div dangerouslySetInnerHTML={{ __html: contentWithIds }} />

                  {shareButtons("blog-share--bottom")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEmbedOpen && (
        <div className="blog-embed-modal" role="dialog" aria-modal="true" aria-labelledby="embed-modal-title" aria-describedby="embed-modal-desc">
          <div className="blog-embed-modal__overlay" onClick={closeEmbedModal} />
          <div className="blog-embed-modal__content" role="document">
            <button type="button" className="blog-embed-modal__close" onClick={closeEmbedModal} aria-label={t("Close")}>
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 id="embed-modal-title">{t("Embed this article")}</h4>
            <p id="embed-modal-desc" className="text">{t("Copy and paste this code into your site.")}</p>
            <label className="blog-embed-modal__label" htmlFor="embed-code-textarea">{t("Embed code")}</label>
            <textarea
              id="embed-code-textarea"
              className="blog-embed-modal__textarea"
              readOnly
              rows={6}
              value={embedCode}
              ref={embedTextareaRef}
              onFocus={(e) => e.target.select()}
            />
            <div className="blog-embed-modal__actions">
              <button type="button" className="blog-embed-modal__copy" onClick={handleCopyEmbed} disabled={!embedCode} aria-live="polite">
                {embedCopyState === "copied" ? t("Copied") : t("Copy embed code")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
