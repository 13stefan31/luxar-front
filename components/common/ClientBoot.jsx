"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const runAfterHydration = (fn) => {
  if (typeof window === "undefined") {
    return;
  }
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => fn(), { timeout: 1000 });
    return;
  }
  setTimeout(fn, 0);
};

export default function ClientBoot() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    runAfterHydration(() => {
      import("bootstrap/dist/js/bootstrap.esm").catch(() => null);

      try {
        // WOW mutates DOM by adding inline styles; defer it so it doesn't race hydration.
        // eslint-disable-next-line global-require
        const { WOW } = require("wowjs");
        const wow = new WOW({ mobile: false, live: false });
        wow.init();
      } catch {
        // ignore
      }
    });
  }, [pathname]);

  return null;
}

