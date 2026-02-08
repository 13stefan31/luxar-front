const INVENTORY_API_ROOT =
  process.env.NEXT_PUBLIC_INVENTORY_API_ROOT ||
  "https://api.luxar-car-rental-montenegro.me/api";

let inventoryRemotePattern = null;
try {
  const inventoryUrl = new URL(INVENTORY_API_ROOT);
  inventoryRemotePattern = {
    protocol: inventoryUrl.protocol.replace(":", ""),
    hostname: inventoryUrl.hostname,
  };
} catch (error) {
  inventoryRemotePattern = null;
}

const remotePatterns = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
  {
    protocol: "https",
    hostname: "images.pexels.com",
  },
  ...(inventoryRemotePattern ? [inventoryRemotePattern] : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
