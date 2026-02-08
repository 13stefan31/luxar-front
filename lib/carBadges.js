const CAR_BADGES = [
  {
    key: "hot",
    label: "Hot",
    icon: "ri-fire-line",
    color: "danger",
    category: "status",
  },
  {
    key: "popular",
    label: "Popular",
    icon: "ri-star-fill",
    color: "warning",
    category: "status",
  },
  {
    key: "new",
    label: "New",
    icon: "ri-flashlight-line",
    color: "info",
    category: "status",
  },
  {
    key: "limited",
    label: "Limited",
    icon: "ri-alarm-warning-line",
    color: "dark",
    category: "status",
  },
  {
    key: "premium",
    label: "Premium",
    icon: "ri-vip-crown-line",
    color: "primary",
    category: "class",
  },
  {
    key: "luxury",
    label: "Luxury",
    icon: "ri-award-line",
    color: "secondary",
    category: "class",
  },
  {
    key: "economy",
    label: "Economy",
    icon: "ri-money-euro-circle-line",
    color: "success",
    category: "class",
  },
  {
    key: "family",
    label: "Family",
    icon: "ri-parent-line",
    color: "success",
    category: "usage",
  },
  {
    key: "city",
    label: "City",
    icon: "ri-building-line",
    color: "info",
    category: "usage",
  },
  {
    key: "travel",
    label: "Travel",
    icon: "ri-suitcase-line",
    color: "primary",
    category: "usage",
  },
  {
    key: "eco",
    label: "Eco",
    icon: "ri-leaf-line",
    color: "success",
    category: "eco",
  },
  {
    key: "electric",
    label: "Electric",
    icon: "ri-battery-charge-line",
    color: "success",
    category: "eco",
  },
  {
    key: "sport",
    label: "Sport",
    icon: "ri-speed-line",
    color: "danger",
    category: "class",
  },
];

const BADGE_COLORS = {
  danger: "#ff9a9e",
  warning: "#ffd6a5",
  info: "#f7c657",
  dark: "#e8d2a6",
  primary: "#a8e6cf",
  secondary: "#f6c4ef",
  success: "#b8f1c2",
};

const hashSeed = (value) => {
  const str = String(value ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = Math.imul(31, hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

const createRng = (seed) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const getBadgeColor = (color) =>
  BADGE_COLORS[color] || "var(--theme-color1)";

const getRandomBadges = (seedValue, maxCount = 2) => {
  const safeMax = Math.min(Math.max(maxCount, 0), CAR_BADGES.length);
  if (!safeMax) {
    return [];
  }
  const rng = createRng(hashSeed(seedValue));
  const count = Math.min(
    safeMax,
    Math.floor(rng() * safeMax) + 1
  );
  const pool = [...CAR_BADGES];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
};

export { CAR_BADGES, getBadgeColor, getRandomBadges };
