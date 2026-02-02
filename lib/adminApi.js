const ADMIN_PROXY_PATH = "/api/admin/login";
const ADMIN_CARS_PROXY_PATH = "/api/admin/cars";
const ADMIN_INSTANCES_PROXY_PATH = "/api/admin/car-instances";
const ADMIN_LOGOUT_PROXY_PATH = "/api/admin/logout";
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

  const response = await fetch(ADMIN_PROXY_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  const payload = await response.json().catch(() => ({
    message: "Prijava nije uspela.",
  }));

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Neuspešna prijava";
    throw new Error(message);
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
  const response = await fetch(targetUrl, {
    method: "GET",
    signal,
    cache: "no-store",
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
  await fetch(ADMIN_LOGOUT_PROXY_PATH, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
  }).catch(() => null);
}

/* Car detail fetch */
export async function adminGetCar(carId, { signal } = {}) {
  const url = buildCarProxyUrl(carId);
  if (!url) {
    throw new Error("Car ID is required.");
  }
  const response = await fetch(url, {
    method: "GET",
    signal,
    cache: "no-store",
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
  const response = await fetch(url, {
    method: "GET",
    signal,
    cache: "no-store",
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
  const response = await fetch(ADMIN_CARS_PROXY_PATH, {
    method: "POST",
    signal,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
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
  const headers = {
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    method: "PUT",
    signal,
    cache: "no-store",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const { error } = buildValidationError(json, "Neuspješno ažuriranje vozila.");
    throw error;
  }
  return json;
}

export async function adminCreateCarInstance(payload, { signal } = {}) {
  const response = await fetch(ADMIN_INSTANCES_PROXY_PATH, {
    method: "POST",
    signal,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
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
  const headers = {
    "Content-Type": "application/json",
  };
  const url = `${ADMIN_INSTANCES_PROXY_PATH}/${encodeURIComponent(
    registrationNumber
  )}`;
  const response = await fetch(url, {
    method: "PUT",
    signal,
    cache: "no-store",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
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
  const response = await fetch(url, {
    method: "DELETE",
    signal,
    cache: "no-store",
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
