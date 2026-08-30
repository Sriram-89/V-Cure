"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { ROUTES } from "@/constants/routes";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!accessToken) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (user && user.role !== "ADMIN") {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [accessToken, user, router]);

  if (!accessToken || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Checking your session"
        />
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-surface-muted text-center">
        <ShieldAlert className="h-8 w-8 text-danger" aria-hidden="true" />
        <p className="text-sm text-text-secondary">
          You don&apos;t have access to this area. Redirecting...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
