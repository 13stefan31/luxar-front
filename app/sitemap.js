import { localizePath } from "@/lib/i18nRoutes";
import { INVENTORY_API_ROOT, getInventoryApiHeaders } from "@/lib/inventoryApi";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxartrade.me";
const LOCALES = ["me", "en", "ru"];

const url = (path) => `${SITE_URL}${path}`;

const staticPages = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/cars", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.4, changeFrequency: "yearly" },
  { path: "/blog-list-01", priority: 0.7, changeFrequency: "weekly" },
  { path: "/trip-planner", priority: 0.6, changeFrequency: "monthly" },
  { path: "/dealer", priority: 0.6, changeFrequency: "monthly" },
  { path: "/montenegro-road-trip", priority: 0.8, changeFrequency: "monthly" },
];

const fetchVehicleIds = async () => {
  try {
    const res = await fetch(`${INVENTORY_API_ROOT}/cars`, {
      headers: getInventoryApiHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).map((c) => c.alias ?? String(c.id)).filter(Boolean);
  } catch {
    return [];
  }
};

const fetchBlogIds = async () => {
  try {
    const res = await fetch(`${INVENTORY_API_ROOT}/blogs`, {
      headers: getInventoryApiHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).map((b) => String(b.id)).filter(Boolean);
  } catch {
    return [];
  }
};

export default async function sitemap() {
  const [vehicleIds, blogIds] = await Promise.all([
    fetchVehicleIds(),
    fetchBlogIds(),
  ]);

  const staticEntries = staticPages.flatMap(({ path, priority, changeFrequency }) =>
    LOCALES.map((locale) => ({
      url: url(localizePath(path, locale)),
      priority,
      changeFrequency,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [
            l === "me" ? "sr-ME" : l,
            url(localizePath(path, l)),
          ])
        ),
      },
    }))
  );

  const vehicleEntries = vehicleIds.flatMap((id) =>
    LOCALES.map((locale) => ({
      url: url(localizePath(`/car/${id}`, locale)),
      priority: 0.8,
      changeFrequency: "weekly",
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [
            l === "me" ? "sr-ME" : l,
            url(localizePath(`/car/${id}`, l)),
          ])
        ),
      },
    }))
  );

  const blogEntries = blogIds.flatMap((id) =>
    LOCALES.map((locale) => ({
      url: url(localizePath(`/blog-single/${id}`, locale)),
      priority: 0.6,
      changeFrequency: "monthly",
    }))
  );

  return [...staticEntries, ...vehicleEntries, ...blogEntries];
}
