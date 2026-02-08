import { buildRemoteUrl } from "./adminEnv";

const ADMIN_PROXY_PATH =
  process.env.NEXT_PUBLIC_ADMIN_PROXY_LOGIN_PATH || "/api/login";
const ADMIN_CARS_PROXY_PATH = "/api/admin/cars";
const ADMIN_INSTANCES_PROXY_PATH = "/api/admin/car-instances";
const ADMIN_CAR_PRICES_PROXY_PATH = "/api/admin/car-prices";
const ADMIN_LOGOUT_PROXY_PATH = "/api/admin/logout";
const ADMIN_API_ROOT = process.env.NEXT_PUBLIC_ADMIN_API_ROOT || "";
const ADMIN_LOGIN_PATH =
  process.env.NEXT_PUBLIC_ADMIN_LOGIN_PATH || "/admin/login";
const ADMIN_LOGIN_URL = buildRemoteUrl(ADMIN_API_ROOT, ADMIN_LOGIN_PATH);
const ADMIN_TOKEN_STORAGE_KEY = "admin_token";

const isRemoteUrl = (value) => /^https?:\/\//i.test(value || "");

const getStoredAdminToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

const setStoredAdminToken = (token) => {
  if (typeof window === "undefined") {
    return;
  }
  const value = typeof token === "string" ? token.trim() : String(token || "");
  if (!value) {
    return;
  }
  try {
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, value);
  } catch {
    // Ignore storage errors (private mode, blocked, etc.)
  }
};

const clearStoredAdminToken = () => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
};

const buildAuthHeader = () => {
  const token = getStoredAdminToken();
  if (!token) {
    return null;
  }
  return token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
};

const withAuthHeaders = (headers = {}) => {
  const authHeader = buildAuthHeader();
  if (!authHeader) {
    return headers;
  }
  if (headers.Authorization || headers.authorization) {
    return headers;
  }
  return { ...headers, Authorization: authHeader };
};

const CAR_FORM_FIELDS = [
  "vehicleName",
  "enginePower",
  "engine",
  "engineType",
  "fuelType",
  "yearOfManufacture",
  "transmissionType",
  "colorItem",
  "seatsNumber",
  "doorNumber",
  "doesHaveAirConditioning",
  "description",
];

const INSTANCE_FORM_FIELDS = [
  "carId",
  "registrationNumber",
  "enginePower",
  "engineCapacity",
  "engineType",
  "transmission",
  "fuelType",
  "price",
  "status",
];

const isFileLike = (value) => {
  if (!value) {
    return false;
  }
  if (typeof File !== "undefined" && value instanceof File) {
    return true;
  }
  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return true;
  }
  return false;
};

const normalizeFileList = (value) => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  if (typeof FileList !== "undefined" && value instanceof FileList) {
    return Array.from(value);
  }
  if (isFileLike(value)) {
    return [value];
  }
  return [];
};

const normalizeFormValue = (value) => {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    return Number.isNaN(value) ? "" : String(value);
  }
  return value ?? "";
};

const appendIfPresent = (formData, key, value) => {
  if (value === undefined || value === null) {
    return;
  }
  if (typeof value === "number" && Number.isNaN(value)) {
    return;
  }
  formData.append(key, normalizeFormValue(value));
};

const buildCarFormData = (payload = {}) => {
  const formData = new FormData();

  CAR_FORM_FIELDS.forEach((field) => {
    appendIfPresent(formData, field, payload[field]);
  });

  const equipment = payload.equipment || payload.additionalEquipment;
  if (equipment && typeof equipment === "object" && !Array.isArray(equipment)) {
    Object.entries(equipment).forEach(([key, value]) => {
      if (!key) {
        return;
      }
      appendIfPresent(formData, `equipment[${key}]`, value);
    });
  }

  if (isFileLike(payload.coverImage)) {
    formData.append("coverImage", payload.coverImage);
  }

  const images = normalizeFileList(payload.images);
  images.forEach((file) => {
    if (isFileLike(file)) {
      formData.append("images[]", file);
    }
  });

  return formData;
};

const buildInstanceFormData = (payload = {}) => {
  const formData = new FormData();

  INSTANCE_FORM_FIELDS.forEach((field) => {
    appendIfPresent(formData, field, payload[field]);
  });

  const additionalEquipment = payload.additionalEquipment;
  if (
    additionalEquipment &&
    typeof additionalEquipment === "object" &&
    !Array.isArray(additionalEquipment)
  ) {
    Object.entries(additionalEquipment).forEach(([key, value]) => {
      if (!key) {
        return;
      }
      appendIfPresent(formData, `additionalEquipment[${key}]`, value);
    });
  }

  if (isFileLike(payload.coverImage)) {
    formData.append("coverImage", payload.coverImage);
  }

  const images = normalizeFileList(payload.images);
  images.forEach((file) => {
    if (isFileLike(file)) {
      formData.append("images[]", file);
    }
  });

  return formData;
};

const buildCarRequest = (payload = {}) => {
  if (typeof FormData === "undefined") {
    return {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    };
  }

  return {
    body: buildCarFormData(payload),
    headers: {},
  };
};

const buildInstanceRequest = (payload = {}) => {
  if (typeof FormData === "undefined") {
    return {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    };
  }

  return {
    body: buildInstanceFormData(payload),
    headers: {},
  };
};
const buildCarProxyUrl = (carId) => {
  if (!carId) {
    return null;
  }
  return `${ADMIN_CARS_PROXY_PATH}/${encodeURIComponent(carId)}`;
};

const buildInstancesQueryUrl = (carId) => {
  if (!carId) {
    return null;
  }
  const params = new URLSearchParams({ carId: String(carId) });
  return `${ADMIN_INSTANCES_PROXY_PATH}?${params.toString()}`;
};

export async function adminLogin({ username, password }) {
  if (!username || !password) {
    throw new Error("Unesite korisničko ime i lozinku.");
  }

  const loginUrl = ADMIN_PROXY_PATH || ADMIN_LOGIN_URL;
  const response = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: isRemoteUrl(loginUrl) ? "omit" : "include",
    body: JSON.stringify({ username, password }),
  });

  const payload = await response.json().catch(() => ({
    message: "Prijava nije uspela.",
  }));

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Neuspešna prijava";
    throw new Error(message);
  }

  if (payload?.token) {
    setStoredAdminToken(payload.token);
  }

  return payload;
}

export async function adminGetCars({ limit, page, signal } = {}) {
  const params = new URLSearchParams();
  if (limit !== undefined) {
    params.set("limit", String(limit));
  }
  if (page !== undefined) {
    params.set("page", String(page));
  }
  const query = params.toString();

  const targetUrl = `${ADMIN_CARS_PROXY_PATH}${query ? `?${query}` : ""}`;
  const headers = withAuthHeaders();
  const response = await fetch(targetUrl, {
    method: "GET",
    signal,
    cache: "no-store",
    headers,
    credentials: "include",
  });

  const payload = await response.json().catch(() => ({
    message: "Podaci o vozilima nisu dostupni.",
  }));
 
  if (!response.ok) {
    const message =
      payload?.message || payload?.error || "Neuspješno učitavanje vozila.";
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function adminLogout() {
  const response = await fetch(ADMIN_LOGOUT_PROXY_PATH, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
  }).catch(() => null);
  clearStoredAdminToken();
  return response?.ok ?? false;
}

/* Car detail fetch */
export async function adminGetCar(carId, { signal } = {}) {
  const url = buildCarProxyUrl(carId);
  if (!url) {
    throw new Error("Car ID is required.");
  }
  const headers = withAuthHeaders();
  const response = await fetch(url, {
    method: "GET",
    signal,
    cache: "no-store",
    headers,
    credentials: "include",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || payload?.error || "Neuspješno učitavanje vozila.";
    throw new Error(message);
  }
  return payload;
}

export async function adminGetCarInstances(carId, { signal } = {}) {
  const url = buildInstancesQueryUrl(carId);
  if (!url) {
    throw new Error("Car ID is required.");
  }
  const headers = withAuthHeaders();
  const response = await fetch(url, {
    method: "GET",
    signal,
    cache: "no-store",
    headers,
    credentials: "include",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.message || payload?.error || "Neuspješno učitavanje varijacija.";
    throw new Error(message);
  }
  return payload;
}

export async function adminCreateCar(payload, { signal } = {}) {
  const { body, headers } = buildCarRequest(payload);
  const headersWithAuth = withAuthHeaders(headers);
  const response = await fetch(ADMIN_CARS_PROXY_PATH, {
    method: "POST",
    signal,
    cache: "no-store",
    headers: headersWithAuth,
    credentials: "include",
    body,
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const { error } = buildValidationError(json, "Neuspješno dodavanje vozila.");
    throw error;
  }
  return json;
}

function buildValidationError(json, fallbackMessage) {
  const violations = json?.violations;
  const detailText =
    (typeof json?.detail === "string" && json.detail) ||
    (Array.isArray(json?.detail) && json.detail.join(" "));
  const violationMessageText =
    violations &&
    Array.isArray(violations) &&
    violations
      .map((v) => v?.message || v?.detail || "")
      .filter(Boolean)
      .join(" ");
  const rawMessage = detailText || violationMessageText || json?.message || json?.error;
  const cleanedMessage = rawMessage
    ? rawMessage.replace(/^[^:]+:\s*/, "").trim()
    : "";
  const message = cleanedMessage || rawMessage || fallbackMessage;

  const validationErrors = violations?.reduce((acc, current) => {
    const path = current?.propertyPath;
    if (path) {
      acc[path] = current?.message || current?.detail || "";
    }
    return acc;
  }, {});

  const error = new Error(message);
  if (validationErrors && Object.keys(validationErrors).length) {
    error.validationErrors = validationErrors;
  }
  return { error, validationErrors };
}

export async function adminUpdateCar(carId, payload, { signal } = {}) {
  const url = buildCarProxyUrl(carId);
  if (!url) {
    throw new Error("Car ID is required.");
  }
  const { body, headers } = buildCarRequest(payload);
  const headersWithAuth = withAuthHeaders(headers);

  const response = await fetch(url, {
    method: "POST",
    signal,
    cache: "no-store",
    headers: headersWithAuth,
    credentials: "include",
    body,
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const { error } = buildValidationError(json, "Neuspješno ažuriranje vozila.");
    throw error;
  }
  return json;
}

export async function adminCreateCarInstance(payload, { signal } = {}) {
  const { body, headers } = buildInstanceRequest(payload);
  const headersWithAuth = withAuthHeaders(headers);
  const response = await fetch(ADMIN_INSTANCES_PROXY_PATH, {
    method: "POST",
    signal,
    cache: "no-store",
    headers: headersWithAuth,
    credentials: "include",
    body,
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const { error } = buildValidationError(json, "Neuspješno dodavanje instance.");
    error.status = response.status;
    throw error;
  }
  return json;
}

export async function adminUpdateCarInstance(
  registrationNumber,
  payload,
  { signal } = {}
) {
  if (!registrationNumber) {
    throw new Error("Registration number is required.");
  }
  const { body, headers } = buildInstanceRequest(payload);
  const headersWithAuth = withAuthHeaders(headers);
  const url = `${ADMIN_INSTANCES_PROXY_PATH}/${encodeURIComponent(
    registrationNumber
  )}`;
  const response = await fetch(url, {
    method: "POST",
    signal,
    cache: "no-store",
    headers: headersWithAuth,
    credentials: "include",
    body,
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const { error } = buildValidationError(json, "Neuspješno ažuriranje instance.");
    error.status = response.status;
    throw error;
  }
  return json;
}

export async function adminDeleteCarInstance(
  registrationNumber,
  { signal } = {}
) {
  if (!registrationNumber) {
    throw new Error("Registration number is required.");
  }
  const url = `${ADMIN_INSTANCES_PROXY_PATH}/${encodeURIComponent(
    registrationNumber
  )}`;
  const headers = withAuthHeaders();
  const response = await fetch(url, {
    method: "DELETE",
    signal,
    cache: "no-store",
    headers,
    credentials: "include",
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const message = json?.message || json?.error || "Neuspješno brisanje varijacije.";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return json;
}

export async function adminCreateCarPrices(payload, { signal } = {}) {
  if (!payload) {
    throw new Error("Podaci za cijene nisu prosleđeni.");
  }
  const headers = withAuthHeaders({
    "Content-Type": "application/json",
  });
  const response = await fetch(ADMIN_CAR_PRICES_PROXY_PATH, {
    method: "POST",
    signal,
    cache: "no-store",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const { error } = buildValidationError(json, "Neuspješno kreiranje cijena.");
    error.status = response.status;
    error.payload = json;
    throw error;
  }
  return json;
}

export async function adminGetCarPrices(
  carId,
  { signal, page, limit } = {}
) {
  if (!carId) {
    throw new Error("Car ID is required.");
  }
  const params = new URLSearchParams({ carId: String(carId) });
  if (page !== undefined) {
    params.set("page", String(page));
  }
  if (limit !== undefined) {
    params.set("itemsPerPage", String(limit));
  }
  const headers = withAuthHeaders();
  const response = await fetch(
    `${ADMIN_CAR_PRICES_PROXY_PATH}?${params.toString()}`,
    {
      method: "GET",
      signal,
      cache: "no-store",
      headers,
      credentials: "include",
    }
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.message || payload?.error || "Neuspješno učitavanje cijena.";
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export async function adminUpdateCarPrice(
  priceId,
  payload,
  { signal } = {}
) {
  if (!priceId) {
    throw new Error("Price ID is required.");
  }
  const headers = withAuthHeaders({
    "Content-Type": "application/json",
  });
  const response = await fetch(
    `${ADMIN_CAR_PRICES_PROXY_PATH}/${encodeURIComponent(priceId)}`,
    {
      method: "PUT",
      signal,
      cache: "no-store",
      headers,
      credentials: "include",
      body: JSON.stringify(payload),
    }
  );
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const { error } = buildValidationError(json, "Neuspješno ažuriranje cijena.");
    error.status = response.status;
    error.payload = json;
    throw error;
  }
  return json;
}

export async function adminDeleteCarPrice(priceId, { signal } = {}) {
  if (!priceId) {
    throw new Error("Price ID is required.");
  }
  const headers = withAuthHeaders();
  const response = await fetch(
    `${ADMIN_CAR_PRICES_PROXY_PATH}/${encodeURIComponent(priceId)}`,
    {
      method: "DELETE",
      signal,
      cache: "no-store",
      headers,
      credentials: "include",
    }
  );
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      json?.message || json?.error || "Neuspješno brisanje cijena.";
    const error = new Error(message);
    error.status = response.status;
    error.payload = json;
    throw error;
  }
  return json;
}
