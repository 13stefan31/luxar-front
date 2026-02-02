const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxartrade.me";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LUXAR TRADE – rent a car",
    template: "%s | LUXAR TRADE – rent a car",
  },
  description: "LUXAR TRADE – rent a car",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "LUXAR TRADE – rent a car",
    description: "LUXAR TRADE – rent a car",
    siteName: "LUXAR TRADE",
    images: [
      {
        url: `${SITE_URL}/images/car.webp`,
        width: 1200,
        height: 630,
        alt: "LUXAR TRADE – rent a car",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LUXAR TRADE – rent a car",
    description: "LUXAR TRADE – rent a car",
    images: [`${SITE_URL}/images/car.webp`],
  },
};
