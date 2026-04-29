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

export default function ClientProviders({ children }) {
  return (
    <>
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
    </>
  );
}
