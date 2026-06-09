const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxar-car-rental-montenegro.me";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/cart",
          "/checkout",
          "/compare",
          "/login",
          "/invoice",
          "/ui-elements",
          "/dealer-single",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
