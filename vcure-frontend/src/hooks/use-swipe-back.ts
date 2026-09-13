"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useSwipeBack(fallbackUrl?: string) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Disable swipe back on top-level root or dashboard
    if (pathname === "/dashboard" || pathname === "/") return;

    let touchStartX = 0;
    let touchStartY = 0;
    let isIgnoredTarget = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest("input, textarea, select") ||
          target.closest(".overflow-x-auto") ||
          target.closest(".no-scrollbar"))
      ) {
        isIgnoredTarget = true;
        return;
      }

      isIgnoredTarget = false;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isIgnoredTarget) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Determine left edge threshold relative to container or window
      let relativeStartX = touchStartX;
      const container = document.querySelector(".max-w-\\[430px\\]");
      if (container) {
        const rect = container.getBoundingClientRect();
        relativeStartX = touchStartX - rect.left;
      }

      // Edge swipe right: start within 40px of left edge, horizontal drag > 50px, vertical drag < 35px
      if (relativeStartX >= 0 && relativeStartX <= 44 && deltaX > 50 && deltaY < 35) {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else if (fallbackUrl) {
          router.push(fallbackUrl);
        } else {
          router.back();
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [router, pathname, fallbackUrl]);
}


