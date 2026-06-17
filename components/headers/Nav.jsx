"use client";

import { headerLinks } from "@/data/menu";
import Link from "@/components/common/LocalizedLink";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "@/context/LanguageContext";
import { getInternalPathname } from "@/lib/i18nRoutes";
import { fetchBlogs } from "@/lib/inventoryApi";

export default function Nav() {
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const [menuBlogs, setMenuBlogs] = useState([]);
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const closeTimer = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetchBlogs(locale, { isMenu: true })
      .then(setMenuBlogs)
      .catch(() => setMenuBlogs([]));
  }, [locale]);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  const handleTriggerEnter = useCallback(() => {
    cancelClose();
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(true);
  }, [cancelClose]);

  const currentPath = getInternalPathname(pathname);
  const isActive = (href) => {
    const targetPath = getInternalPathname(href);
    return currentPath.split("/")[1] === targetPath.split("/")[1];
  };

  const dropdown = mounted && open && menuBlogs.length > 0
    ? createPortal(
        <ul
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          style={{
            position: "fixed",
            top: dropdownPos.top,
            left: dropdownPos.left,
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: "20px",
            minWidth: 260,
            boxShadow: "0px 8px 24px rgba(64,79,104,0.18)",
            border: "1px solid rgba(0,0,0,0.08)",
            zIndex: 999999,
            margin: 0,
            listStyle: "none",
          }}
        >
          {menuBlogs.map((blog) => (
            <li key={blog.id} style={{ marginBottom: 10 }}>
              <Link
                href={
                  blog.alias
                    ? `/services/${blog.id}/${blog.alias}`
                    : `/services/${blog.id}`
                }
                style={{ color: "#050b20", display: "block", fontSize: 15 }}
              >
                {blog.title}
              </Link>
            </li>
          ))}
        </ul>,
        document.body
      )
    : null;

  return (
    <>
      {headerLinks.map((item, index) => {
        if (item.key === "services") {
          return (
            <li
              key={index}
              ref={triggerRef}
              className="current-dropdown"
              onMouseEnter={handleTriggerEnter}
              onMouseLeave={scheduleClose}
            >
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className={isActive(item.href) ? "menuActive" : ""}
              >
                {t(item.title)}
                <i className={`fa fa-angle-${open ? "up" : "down"}`} style={{ marginLeft: 6, fontSize: 12 }} />
              </a>
              {dropdown}
            </li>
          );
        }

        return (
          <li key={index}>
            <Link
              href={item.href}
              className={isActive(item.href) ? "menuActive" : ""}
            >
              {t(item.title)}
            </Link>
          </li>
        );
      })}
    </>
  );
}
