"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function BlogShareButtons({ blogTitle, extraClass }) {
  const { t } = useLanguage();
  const [shareUrl, setShareUrl] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const [embedCopyState, setEmbedCopyState] = useState("idle");
  const embedTextareaRef = useRef(null);
  const embedTriggerRef = useRef(null);

  const embedCode = useMemo(() => {
    if (!shareUrl) return "";
    const title = (blogTitle || "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    const url = shareUrl.replaceAll("&", "&amp;");
    return `<div style="position:relative;width:100%;padding-top:56.25%;overflow:hidden;border-radius:12px;">\n  <iframe src="${url}" title="${title}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>\n</div>`;
  }, [shareUrl, blogTitle]);

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
        await navigator.share({ title: blogTitle || "", url: shareUrl });
        return;
      } catch {}
    }
    await handleCopyLink();
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }, [blogTitle, shareUrl, handleCopyLink]);

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

  const facebookShareUrl = shareUrl
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    : "";
  const whatsappShareUrl = shareUrl
    ? `https://wa.me/?text=${encodeURIComponent(`${blogTitle || ""} ${shareUrl}`)}`
    : "";

  return (
    <>
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
    </>
  );
}
