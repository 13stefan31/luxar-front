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
import { Toaster } from "react-hot-toast";
export default function RootLayout({ children }) {
  return (
    <html lang="me">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <LanguageProvider>
            <Context>
              <MobileMenu />
              <div className="boxcar-wrapper">{children}</div>
              <FilterSidebar />
              <ClientBoot />
            </Context>
          </LanguageProvider>
        </Suspense>
        <Toaster position="top-right" />
        <BackToTop />
      </body>
    </html>
  );
}
