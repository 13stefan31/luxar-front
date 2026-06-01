const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxartrade.me";

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
          "/loan-calculator",
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
