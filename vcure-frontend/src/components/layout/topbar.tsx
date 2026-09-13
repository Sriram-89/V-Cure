"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth-service";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBellPanel } from "@/components/notifications/notification-bell-panel";
import { ROUTES } from "@/constants/routes";

export function TopBar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // proceed with local logout even if the request fails
    }
    clearSession();
    router.replace(ROUTES.LOGIN);
  };

  return (
    <header className="hidden lg:flex sticky top-0 z-40 h-16 items-center justify-between border-b border-border bg-surface px-4 lg:px-8">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md lg:hidden"
        aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMobileNavOpen}
        onClick={() => setIsMobileNavOpen((prev) => !prev)}
      >
        {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <span className="text-sm font-medium text-text-secondary">
        {user ? `Hi, ${user.fullName.split(" ")[0]}` : ""}
      </span>

      <div className="flex items-center gap-1">
        <NotificationBellPanel />
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 px-2 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </button>
      </div>

      {isMobileNavOpen ? (
        <div className="absolute left-0 top-16 w-full border-b border-border bg-surface lg:hidden">
          <Sidebar key={pathname} className="block w-full border-r-0" />
        </div>
      ) : null}
    </header>
  );
}
