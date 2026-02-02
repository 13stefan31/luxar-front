const SUPPORTED_LOCALES = ["en", "me", "ru"];
const DEFAULT_LOCALE = "me";
const PREFIX_DEFAULT_LOCALE = true;

const SEGMENT_TRANSLATIONS = {
  cars: { en: "cars", me: "vozila", ru: "avtomobili" },
  car: { en: "car", me: "vozilo", ru: "avto" },
  about: { en: "about", me: "o-nama", ru: "o-nas" },
  contact: { en: "contact", me: "kontakt", ru: "kontakt" },
  faq: { en: "faq", me: "pitanja", ru: "voprosy" },
  terms: { en: "terms", me: "uslovi", ru: "usloviya" },
  compare: { en: "compare", me: "uporedi", ru: "sravnenie" },
  dealer: { en: "dealer", me: "dileri", ru: "dilery" },
  "dealer-single": {
    en: "dealer-single",
    me: "diler",
    ru: "diler",
  },
  "team-list": { en: "team-list", me: "tim", ru: "komanda" },
  "blog-list-01": { en: "blog-list-01", me: "blog", ru: "blog" },
  "blog-single": { en: "blog-single", me: "blog", ru: "blog" },
  cart: { en: "cart", me: "korpa", ru: "korzina" },
  checkout: { en: "checkout", me: "naplata", ru: "oplata" },
  login: { en: "login", me: "prijava", ru: "vhod" },
  dashboard: {
    en: "dashboard",
    me: "kontrolna-tabla",
    ru: "panel",
  },
  "my-listings": {
    en: "my-listings",
    me: "moji-oglasi",
    ru: "moi-obyavleniya",
  },
  profile: { en: "profile", me: "profil", ru: "profil" },
  saved: { en: "saved", me: "sacuvano", ru: "sohraneno" },
  messages: {
    en: "messages",
    me: "poruke",
    ru: "soobshcheniya",
  },
  "add-listings": {
    en: "add-listings",
    me: "dodaj-oglase",
    ru: "dobavit-obyavleniya",
  },
  invoice: { en: "invoice", me: "faktura", ru: "schet" },
  "loan-calculator": {
    en: "loan-calculator",
    me: "kreditni-kalkulator",
    ru: "kreditnyy-kalkulyator",
  },
  "ui-elements": {
    en: "ui-elements",
    me: "ui-elementi",
    ru: "ui-elementy",
  },
  "inventory-map-rows": {
    en: "inventory-map-rows",
    me: "mapa-liste",
    ru: "karta-spisok",
  },
  "inventory-map-cards": {
    en: "inventory-map-cards",
    me: "mapa-kartice",
    ru: "karta-kartochki",
  },
  "inventory-list-02": {
    en: "inventory-list-02",
    me: "lista-vozila",
    ru: "spisok-avto",
  },
  "inventory-sidebar-rows": {
    en: "inventory-sidebar-rows",
    me: "lista-filteri",
    ru: "spisok-filtry",
  },
  "inventory-sidebar-cards": {
    en: "inventory-sidebar-cards",
    me: "kartice-filteri",
    ru: "kartochki-filtry",
  },
  "rent-inventory": {
    en: "rent-inventory",
    me: "iznajmi-vozilo",
    ru: "arenda-avto",
  },
};

const SEGMENT_TYPES = {
  car: "detail",
  "dealer-single": "detail",
  "blog-single": "detail",
};

const buildReverseMap = () => {
  const reverse = {};
  SUPPORTED_LOCALES.forEach((locale) => {
    reverse[locale] = {};
  });
  Object.entries(SEGMENT_TRANSLATIONS).forEach(([internal, map]) => {
    Object.entries(map).forEach(([locale, localized]) => {
      if (!reverse[locale][localized]) {
        reverse[locale][localized] = internal;
        return;
      }
      const current = reverse[locale][localized];
      reverse[locale][localized] = Array.isArray(current)
        ? [...current, internal]
        : [current, internal];
    });
  });
  return reverse;
};

const REVERSE_SEGMENTS = buildReverseMap();

const cleanPathname = (pathname) => {
  if (!pathname) {
    return "/";
  }
  const withoutHash = String(pathname).split("#")[0];
  const withoutQuery = withoutHash.split("?")[0];
  if (!withoutQuery.startsWith("/")) {
    return `/${withoutQuery}`;
  }
  return withoutQuery || "/";
};

const splitSegments = (pathname) =>
  cleanPathname(pathname).split("/").filter(Boolean);

export const getLocaleFromPath = (pathname) => {
  const segments = splitSegments(pathname);
  return SUPPORTED_LOCALES.includes(segments[0]) ? segments[0] : DEFAULT_LOCALE;
};

export const stripLocaleFromPath = (pathname) => {
  const segments = splitSegments(pathname);
  if (segments.length && SUPPORTED_LOCALES.includes(segments[0])) {
    return {
      locale: segments[0],
      pathWithoutLocale: `/${segments.slice(1).join("/")}`,
      hadLocalePrefix: true,
    };
  }
  return {
    locale: DEFAULT_LOCALE,
    pathWithoutLocale: cleanPathname(pathname),
    hadLocalePrefix: false,
  };
};

export const toInternalPath = (pathname, localeOverride) => {
  const { locale, pathWithoutLocale } = stripLocaleFromPath(pathname);
  const effectiveLocale = localeOverride || locale;
  const segments = splitSegments(pathWithoutLocale);
  if (!segments.length) {
    return "/";
  }
  const [first, ...rest] = segments;
  const reverseMap = REVERSE_SEGMENTS[effectiveLocale] || {};
  let internalFirst = reverseMap[first] || first;
  if (Array.isArray(internalFirst)) {
    const prefersDetail = rest.length > 0;
    const preferredType = prefersDetail ? "detail" : "list";
    const match = internalFirst.find(
      (segment) => SEGMENT_TYPES[segment] === preferredType
    );
    internalFirst = match || internalFirst[0];
  }
  return `/${[internalFirst, ...rest].join("/")}`;
};

export const getInternalPathname = (pathname) => toInternalPath(pathname);

export const localizePath = (pathname, locale) => {
  const internalPath = toInternalPath(pathname);
  const segments = splitSegments(internalPath);
  const effectiveLocale = SUPPORTED_LOCALES.includes(locale)
    ? locale
    : DEFAULT_LOCALE;

  if (!segments.length) {
    if (PREFIX_DEFAULT_LOCALE || effectiveLocale !== DEFAULT_LOCALE) {
      return `/${effectiveLocale}`;
    }
    return "/";
  }

  let pathSegments = segments;
  if (SUPPORTED_LOCALES.includes(segments[0])) {
    pathSegments = segments.slice(1);
  }

  const [first, ...rest] = pathSegments;
  const localizedFirst =
    SEGMENT_TRANSLATIONS[first]?.[effectiveLocale] || first;
  let localizedPath = `/${[localizedFirst, ...rest].join("/")}`;

  if (PREFIX_DEFAULT_LOCALE || effectiveLocale !== DEFAULT_LOCALE) {
    localizedPath = `/${effectiveLocale}${localizedPath}`;
  }

  return localizedPath;
};

export const localizeHref = (href, locale) => {
  if (!href) {
    return href;
  }
  if (typeof href === "string") {
    if (
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("#")
    ) {
      return href;
    }
    const [path, hash] = href.split("#");
    const [pathname, query] = path.split("?");
    const localizedPath = localizePath(pathname, locale);
    const withQuery = query ? `${localizedPath}?${query}` : localizedPath;
    return hash ? `${withQuery}#${hash}` : withQuery;
  }
  if (typeof href === "object" && href.pathname) {
    return {
      ...href,
      pathname: localizePath(href.pathname, locale),
    };
  }
  return href;
};

export const supportedLocales = SUPPORTED_LOCALES;
export const defaultLocale = DEFAULT_LOCALE;
export const prefixDefaultLocale = PREFIX_DEFAULT_LOCALE;
