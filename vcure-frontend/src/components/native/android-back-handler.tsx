"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

const ROOT_ROUTES = [
  "/dashboard",
  "/login",
  "/language-select",
  "/auth/login",
  "/auth/register"
];

export function AndroidBackHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = App.addListener("backButton", ({ canGoBack }) => {
      // 1. Check if any open modal or drawer overlay exists on screen
      const openOverlay = document.querySelector('[role="dialog"], [data-state="open"]');
      if (openOverlay) {
        const closeBtn = openOverlay.querySelector<HTMLButtonElement>('button[aria-label*="Close"], button[aria-label*="close"]');
        if (closeBtn) {
          closeBtn.click();
          return;
        }
      }

      // 2. If on root landing page, minimize/exit app safely
      if (ROOT_ROUTES.includes(pathname)) {
        App.exitApp();
        return;
      }

      // 3. Otherwise navigate back if web history is available
      if (canGoBack || window.history.length > 1) {
        router.back();
      } else {
        App.exitApp();
      }
    });

    return () => {
      listenerPromise.then((handle) => handle.remove()).catch(() => {});
    };
  }, [pathname, router]);

  return null;
}
