"use client";
import React from "react";
import Link from "@/components/common/LocalizedLink";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getInternalPathname } from "@/lib/i18nRoutes";

const BASE_PATH = process.env.NEXT_PUBLIC_ADMIN_BASE_PATH || "/admin";
const menuItems = [
  { href: "/dashboard", icon: "/images/icons/dash1.svg", label: "Dashboard" },
  { href: "/vozila", icon: "/images/icons/dash2.svg", label: "Vozila" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const currentPath = getInternalPathname(pathname);

  return (
    <div className="side-bar">
      <ul className="nav-list">
        {menuItems.map((item) => (
          <li key={item.href}>
            <Link
              href={`${BASE_PATH}${item.href}`}
              className={
                currentPath === getInternalPathname(`${BASE_PATH}${item.href}`)
                  ? "menuActive"
                  : ""
              }
            >
              <Image
                alt={item.label}
                src={item.icon}
                width={18}
                height={18}
              />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
