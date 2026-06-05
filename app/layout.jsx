import ClientProviders from "./ClientProviders";
import { DM_Sans } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";

const LANG_CODES = { en: "en", me: "sr-ME", ru: "ru" };

const dmSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-dm-sans",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://luxartrade.me";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "LUXAR TRADE – rent a car",
    template: "%s | LUXAR TRADE – rent a car",
  },
  description: "LUXAR TRADE – rent a car",
  icons: {
    icon: [
      { url: "/images/favicon/favicon.ico", sizes: "any" },
      { url: "/images/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: { url: "/images/favicon/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/images/favicon/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: "LUXAR TRADE – rent a car",
    description: "LUXAR TRADE – rent a car",
    siteName: "LUXAR TRADE",
    images: [
      {
        url: "/images/logo.png",
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
    images: ["/images/logo.png"],
  },
  verification: {
    google: "ZbyhfvTEW1nf8uN-CgCZclAvDAFbpssiV7dMnt1Pe6s",
  },
};

export default function RootLayout({ children }) {
  const locale = headers().get("x-locale") || "me";
  const lang = LANG_CODES[locale] || "sr-ME";
  return (
    <html lang={lang} className={dmSans.variable}>
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
        />
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-861YQ9ED3T"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-861YQ9ED3T');
          `}
        </Script>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
