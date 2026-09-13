"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { ROUTES } from "@/constants/routes";

export default function RootPage() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasSelectedLanguage = useLanguageStore((state) => state.hasSelectedLanguage);

  useEffect(() => {
    if (accessToken) {
      router.replace(ROUTES.DASHBOARD);
    } else if (!hasSelectedLanguage) {
      router.replace("/language-select");
    } else {
      router.replace(ROUTES.LOGIN);
    }
  }, [accessToken, hasSelectedLanguage, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
        role="status"
        aria-label="Loading V-Cure..."
      />
    </div>
  );
}

