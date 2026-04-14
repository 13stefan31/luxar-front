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
export default function RootLayout({ children }) {
  return (
    <html lang="me">
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
          media="print"
          onLoad="this.media='all'"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
            rel="stylesheet"
          />
        </noscript>
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
