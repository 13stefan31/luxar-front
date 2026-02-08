import Single1 from "@/components/carSingles/Single1";
import Footer1 from "@/components/footers/Footer1";
import Header1 from "@/components/headers/Header1";
import {
  getInventoryApiHeaders,
  INVENTORY_API_ROOT,
  normalizeInventoryImageUrl,
} from "@/lib/inventoryApi";

const FALLBACK_IMAGE = "/images/car.webp";
const FUEL_LABELS = {
  D: "Diesel",
  B: "Petrol",
  P: "Petrol",
  E: "Electric",
  H: "Hybrid",
  G: "Gas",
};
const TRANSMISSION_LABELS = {
  A: "Automatic",
  M: "Manual",
};
const formatEngine = (engine) => (engine ? `${engine} cc` : "—");
const formatFuel = (value) => FUEL_LABELS[value] || value || "—";
const formatTransmission = (value) =>
  TRANSMISSION_LABELS[value] || value || "—";
const buildDescription = (car) => {
  const parts = [];
  if (car.manufactureYear) {
    parts.push(`${car.manufactureYear}`);
  }
  if (car.seatCapacity) {
    parts.push(`${car.seatCapacity} seats`);
  }
  if (car.doorCount) {
    parts.push(`${car.doorCount} doors`);
  }
  if (car.colorItem) {
    parts.push(`${car.colorItem}`);
  }
  return parts.join(" · ");
};
const isImageUrl = (url) =>
  /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url);
const resolveImages = (images) => {
  const paths = Array.isArray(images)
    ? images.map((image) => image?.path).filter(Boolean)
    : [];
  const normalized = paths
    .map((path) => normalizeInventoryImageUrl(path, ""))
    .filter(Boolean);
  const valid = normalized.filter(isImageUrl);
  if (valid.length) {
    return valid;
  }
  if (normalized.length) {
    return [normalized[0]];
  }
  return [FALLBACK_IMAGE];
};
const pickInstance = (instances) => {
  if (!Array.isArray(instances) || instances.length === 0) {
    return null;
  }
  const baseInstance = instances.find((instance) => {
    const equipment =
      instance.additionalEquipment ?? instance.additional_equipment;
    if (!equipment) {
      return true;
    }
    if (Array.isArray(equipment)) {
      return equipment.length === 0;
    }
    if (typeof equipment === "object") {
      return Object.keys(equipment).length === 0;
    }
    return false;
  });
  return baseInstance || instances[0];
};
const buildCarItem = (car, images, instanceUuid) => {
  const title = car.name || car.alias || "Vehicle";
  return {
    id: car.id,
    alias: car.alias,
    title,
    description: buildDescription(car),
    images,
    instanceUuid,
    specs: [
      {
        icon: "/images/placeholder.svg",
        text: car.manufactureYear ? `${car.manufactureYear}` : "—",
      },
      { icon: "/images/placeholder.svg", text: formatEngine(car.engine) },
      {
        icon: "/images/placeholder.svg",
        text: formatTransmission(car.transmissionType),
      },
      {
        icon: "/images/placeholder.svg",
        text: formatFuel(car.fuelType),
      },
    ],
    raw: car,
  };
};

const fetchCarList = async () => {
  try {
    const listResponse = await fetch(`${INVENTORY_API_ROOT}/cars`, {
      cache: "no-store",
      headers: getInventoryApiHeaders(),
    });
    if (!listResponse.ok) {
      return [];
    }
    const payload = await listResponse.json();
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch (error) {
    return [];
  }
};

const fetchCarDetail = async (alias, instanceCode) => {
  try {
    const detailResponse = await fetch(
      `${INVENTORY_API_ROOT}/cars/${encodeURIComponent(alias)}/code/${encodeURIComponent(
        instanceCode
      )}`,
      { cache: "no-store", headers: getInventoryApiHeaders() }
    );
    if (!detailResponse.ok) {
      return null;
    }
    const detailPayload = await detailResponse.json();
    return detailPayload?.data || null;
  } catch {
    return null;
  }
};

const buildParamCandidates = (rawId) => {
  if (typeof rawId !== "string") {
    return [];
  }
  const trimmed = rawId.trim();
  if (!trimmed) {
    return [];
  }
  const candidates = new Set([trimmed]);
  const hyphenIndex = trimmed.indexOf("-");
  if (hyphenIndex >= 0) {
    const idChunk = trimmed.slice(0, hyphenIndex);
    const aliasChunk = trimmed.slice(hyphenIndex + 1);
    if (idChunk) {
      candidates.add(idChunk);
    }
    if (aliasChunk) {
      candidates.add(aliasChunk);
    }
  }
  return [...candidates];
};

const loadCar = async ({ params, searchParams }) => {
  const listData = await fetchCarList();
  const fallbackCar = listData[0] || {};
  const candidates = buildParamCandidates(params.id);
  const listCar =
    listData.find((item) =>
      candidates.some(
        (candidate) =>
          String(item.id) === candidate ||
          (typeof item.alias === "string" && item.alias === candidate)
      )
    ) || fallbackCar;
  const alias =
    listCar?.alias ?? (listCar?.id ? String(listCar.id) : params.id ?? "");
  const instanceParam =
    typeof searchParams?.instance === "string" ? searchParams.instance : "";
  const fallbackInstance = pickInstance(listCar?.instances);
  const instanceCode = instanceParam || fallbackInstance?.uuid;
  const detailCar =
    alias && instanceCode ? await fetchCarDetail(alias, instanceCode) : null;
  const carData = detailCar || listCar || {};
  const images = resolveImages(detailCar?.images || listCar?.images);
  const carItem = buildCarItem(carData, images, instanceCode);
  return { carItem, carData };
};

export async function generateMetadata({ params, searchParams }) {
  const { carItem } = await loadCar({ params, searchParams });
  const label = carItem?.title || "Vehicle";
  const description = carItem?.description || "LUXAR TRADE - rent a car";
  return {
    title: `${label} || LUXAR TRADE - rent a car`,
    description,
  };
}

export default async function InventorySinglePage1({ params, searchParams }) {
  const { carItem } = await loadCar({ params, searchParams });
  return (
    <>
      <Header1 headerClass="boxcar-header header-style-v1 style-two inner-header cus-style-1" />
      <Single1 carItem={carItem} />
      <Footer1 parentClass="boxcar-footer footer-style-one v1 cus-st-1" />
    </>
  );
}
