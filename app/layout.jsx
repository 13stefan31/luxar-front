"use client";
import FilterSidebar from "@/components/common/FilterSidebar";
import ClientBoot from "@/components/common/ClientBoot";
import "../public/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import { Suspense } from "react";
import MobileMenu from "@/components/headers/MobileMenu";
import Context from "@/context/Context";
import BackToTop from "@/components/common/BackToTop";
import { LanguageProvider } from "@/context/LanguageContext";
import FloatingActionProvider from "@/context/FloatingActionContext";
import { Toaster } from "react-hot-toast";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-dm-sans",
});

export default function RootLayout({ children }) {
  return (
    <html lang="me" className={dmSans.variable}>
      <head>
        <link rel="icon" href="/images/favicon/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/favicon/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/favicon/apple-touch-icon.png"
        />
        <link rel="manifest" href="/images/favicon/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
        <link
          rel="preload"
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          as="style"
          onLoad="this.rel='stylesheet'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          />
        </noscript>
      </head>
      <body>
        <Suspense fallback={null}>
          <FloatingActionProvider>
            <LanguageProvider>
              <Context>
                <MobileMenu />
                <div className="boxcar-wrapper">{children}</div>
                <FilterSidebar />
                <ClientBoot />
                <BackToTop />
              </Context>
            </LanguageProvider>
          </FloatingActionProvider>
        </Suspense>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
