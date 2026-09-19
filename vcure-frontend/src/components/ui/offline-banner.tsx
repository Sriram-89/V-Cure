"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function MobileOfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500/95 px-4 py-2 text-xs font-bold text-white shadow-md backdrop-blur-xs transition-all animate-in slide-in-from-top duration-200"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>Offline Mode — Viewing cached V-Cure health data</span>
    </div>
  );
}
