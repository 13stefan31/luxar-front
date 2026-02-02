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

export const getInventoryApiHeaders = () =>
  INVENTORY_API_KEY ? { "x-api-key": INVENTORY_API_KEY } : {};

export {
  INVENTORY_API_ROOT,
  INVENTORY_API_PROXY_ROOT,
  INVENTORY_API_REMOTE_ROOT,
};
