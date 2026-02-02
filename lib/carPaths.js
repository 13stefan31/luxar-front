const slugifyText = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const resolveSlugSource = (car) => {
  if (!car) {
    return "";
  }
  const candidates = [
    car.alias,
    car.slug,
    car.slug_name,
    car.slugName,
    car.title,
    car.name,
    car.vehicle_name,
    car.vehicleName,
    car.model,
    car.brand,
    car.description,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }
  const idCandidate =
    car.id ?? car.vehicleId ?? car.vehicle_id ?? car.referenceId ?? car.reference_id;
  if (idCandidate) {
    return String(idCandidate);
  }
  return "";
};

export const getCarSlugChunk = (car) => slugifyText(resolveSlugSource(car));

export const getCarDetailHref = (car, options = {}) => {
  if (!car) {
    return "/car";
  }
  const fallbackId =
    options.id ??
    car.id ??
    car.vehicleId ??
    car.vehicle_id ??
    options.fallbackId ??
    "";
  const slug = options.slug ?? getCarSlugChunk(car);
  if (fallbackId) {
    const idString = String(fallbackId);
    if (slug && slug !== idString) {
      return `/car/${idString}-${slug}`;
    }
    return `/car/${idString}`;
  }
  if (slug) {
    return `/car/${slug}`;
  }
  return "/car";
};
