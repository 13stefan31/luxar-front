const CAR_BADGES = [
  {
    key: "hot",
    label: "Hot",
    icon: "ri-fire-line",
    color: "hot",
    category: "status",
  },
  {
    key: "popular",
    label: "Popular",
    icon: "ri-star-fill",
    color: "popular",
    category: "status",
  },
  {
    key: "new",
    label: "New",
    icon: "ri-flashlight-line",
    color: "new",
    category: "status",
  },
  {
    key: "limited",
    label: "Limited",
    icon: "ri-alarm-warning-line",
    color: "limited",
    category: "status",
  },
  {
    key: "premium",
    label: "Premium",
    icon: "ri-vip-crown-line",
    color: "premium",
    category: "class",
  },
  {
    key: "luxury",
    label: "Luxury",
    icon: "ri-award-line",
    color: "luxury",
    category: "class",
  },
  {
    key: "economy",
    label: "Economy",
    icon: "ri-money-euro-circle-line",
    color: "economy",
    category: "class",
  },
  {
    key: "family",
    label: "Family",
    icon: "ri-parent-line",
    color: "family",
    category: "usage",
  },
  {
    key: "city",
    label: "City",
    icon: "ri-building-line",
    color: "city",
    category: "usage",
  },
  {
    key: "travel",
    label: "Travel",
    icon: "ri-suitcase-line",
    color: "travel",
    category: "usage",
  },
  {
    key: "eco",
    label: "Eco",
    icon: "ri-leaf-line",
    color: "eco",
    category: "eco",
  },
  {
    key: "electric",
    label: "Electric",
    icon: "ri-battery-charge-line",
    color: "electric",
    category: "eco",
  },
  {
    key: "sport",
    label: "Sport",
    icon: "ri-speed-line",
    color: "sport",
    category: "class",
  },
];

const BADGE_COLORS = {
  hot: "#f6b2a8",
  popular: "#f2d39b",
  new: "#b8d7f2",
  limited: "#e6dcc6",
  premium: "#e6c783",
  luxury: "#e3c1e8",
  economy: "#bfe4c7",
  family: "#c2e6de",
  city: "#c7d6ee",
  travel: "#b9e1d4",
  eco: "#c7e8c2",
  electric: "#b9e6f2",
  sport: "#f0c2a1",
  danger: "#f6b2a8",
  warning: "#f2d39b",
  info: "#b8d7f2",
  dark: "#e6dcc6",
  primary: "#e6c783",
  secondary: "#e3c1e8",
  success: "#bfe4c7",
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
