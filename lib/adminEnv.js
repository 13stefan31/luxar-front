const readEnv = (key) => {
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : "";
};

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

const getAdminEnv = () => {
  const apiRoot = readEnv("NEXT_PUBLIC_ADMIN_API_ROOT");
  const loginPath = readEnv("NEXT_PUBLIC_ADMIN_LOGIN_PATH");
  const apiKey = readEnv("NEXT_PUBLIC_ADMIN_API_KEY");
  const carsPath = readEnv("NEXT_PUBLIC_ADMIN_CARS_PATH");

  return {
    apiRoot,
    loginPath,
    apiKey,
    carsPath,
  };
};

const buildRemoteUrl = (base, path, search) => {
  if (!path) {
    return null;
  }

  let urlString;
  if (isAbsoluteUrl(path)) {
    urlString = path;
  } else if (base) {
    const trimmedBase = base.replace(/\/$/, "");
    const trimmedPath = path.startsWith("/") ? path : `/${path}`;
    urlString = `${trimmedBase}${trimmedPath}`;
  } else {
    return null;
  }

  try {
    const url = new URL(urlString);
    if (typeof search === "string") {
      url.search = search;
    }
    return url.toString();
  } catch {
    return null;
  }
};

export { buildRemoteUrl, getAdminEnv };
