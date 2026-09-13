"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Stethoscope,
  FileText,
  UtensilsCrossed,
  BookOpen,
  Activity,
  TrendingUp,
  ShoppingCart,
  Bot,
  Bell,
  Settings,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth-store";

const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Profile", href: ROUTES.PROFILE, icon: User },
  { label: "Medical", href: ROUTES.MEDICAL, icon: Stethoscope },
  { label: "Reports", href: ROUTES.REPORTS, icon: FileText },
  { label: "Meals", href: ROUTES.MEALS, icon: UtensilsCrossed },
  { label: "Recipes", href: ROUTES.RECIPES, icon: BookOpen },
  { label: "Tracking", href: ROUTES.TRACKING, icon: Activity },
  { label: "Progress", href: ROUTES.PROGRESS, icon: TrendingUp },
  { label: "Shopping", href: ROUTES.SHOPPING, icon: ShoppingCart },
  { label: "AI Coach", href: ROUTES.AI_COACH, icon: Bot },
  { label: "Notifications", href: ROUTES.NOTIFICATIONS, icon: Bell },
  { label: "Settings", href: ROUTES.SETTINGS, icon: Settings }
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const isAdmin = useAuthStore((state) => state.user?.role === "ADMIN");

  return (
    <nav
      aria-label="Primary"
      className={cn("hidden w-60 shrink-0 border-r border-border bg-surface lg:block", className)}
    >
      <div className="flex h-16 items-center px-6 font-semibold">V-Cure</div>
      <ul className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary",
                  isActive && "bg-primary-50 text-primary-700 hover:bg-primary-50 hover:text-primary-700"
                )}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
        {isAdmin ? (
          <li>
            <Link
              href={ROUTES.ADMIN}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Admin
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
