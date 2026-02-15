const DEFAULT_INVENTORY_API_ROOT =
  "https://api.luxar-car-rental-montenegro.me/api";

const INVENTORY_API_REMOTE_ROOT = (
  process.env.NEXT_PUBLIC_INVENTORY_API_ROOT || DEFAULT_INVENTORY_API_ROOT
).replace(/\/$/, "");

const INVENTORY_API_PROXY_ROOT = "/api/inventory";

const INVENTORY_API_ROOT =
  typeof window === "undefined"
    ? INVENTORY_API_REMOTE_ROOT
    : INVENTORY_API_PROXY_ROOT;

const INVENTORY_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
const INVENTORY_API_BEARER_TOKEN = process.env.INVENTORY_API_BEARER_TOKEN || "";

const normalizeBearerToken = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return /^bearer\s+/i.test(trimmed) ? trimmed : `Bearer ${trimmed}`;
};

const INVENTORY_API_ORIGIN = (() => {
  try {
    return new URL(INVENTORY_API_REMOTE_ROOT).origin;
  } catch (error) {
    return "";
  }
})();

const isAbsoluteImageUrl = (value) =>
  /^(https?:)?\/\//i.test(value) ||
  /^data:/i.test(value) ||
  /^blob:/i.test(value) ||
  /^file:/i.test(value);

const normalizeInventoryImageUrl = (value, fallback = "") => {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  if (INVENTORY_API_ORIGIN && trimmed.includes(INVENTORY_API_ORIGIN)) {
    return trimmed;
  }
  if (isAbsoluteImageUrl(trimmed)) {
    return trimmed;
  }
  const normalizedPath = trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed.replace(/^\/+/, "")}`;
  if (INVENTORY_API_ORIGIN) {
    return `${INVENTORY_API_ORIGIN}${normalizedPath}`;
  }
  return normalizedPath;
};

export const getInventoryApiHeaders = () => {
  const headers = {};
  if (INVENTORY_API_KEY) {
    headers["x-api-key"] = INVENTORY_API_KEY;
  }
  const authorization = normalizeBearerToken(INVENTORY_API_BEARER_TOKEN);
  if (authorization) {
    headers.Authorization = authorization;
  }
  return headers;
};

export {
  INVENTORY_API_ROOT,
  INVENTORY_API_PROXY_ROOT,
  INVENTORY_API_REMOTE_ROOT,
  INVENTORY_API_ORIGIN,
  normalizeInventoryImageUrl,
};
