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
import { useTranslation } from "@/hooks/use-translation";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const isAdmin = useAuthStore((state) => state.user?.role === "ADMIN");
  const { t } = useTranslation();

  const navItems = [
    { label: t.navDashboard, href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: t.navProfile, href: ROUTES.PROFILE, icon: User },
    { label: t.stepConditionsMedications, href: ROUTES.MEDICAL, icon: Stethoscope },
    { label: t.medicalReports, href: ROUTES.REPORTS, icon: FileText },
    { label: t.navMeals, href: ROUTES.MEALS, icon: UtensilsCrossed },
    { label: t.healthArticles, href: ROUTES.RECIPES, icon: BookOpen },
    { label: t.progressTitle, href: ROUTES.TRACKING, icon: Activity },
    { label: t.navProgress, href: ROUTES.PROGRESS, icon: TrendingUp },
    { label: t.navShopping, href: ROUTES.SHOPPING, icon: ShoppingCart },
    { label: t.navCoach, href: ROUTES.AI_COACH, icon: Bot },
    { label: t.insuranceExpiryNotice, href: ROUTES.NOTIFICATIONS, icon: Bell },
    { label: t.navSettings, href: ROUTES.SETTINGS, icon: Settings }
  ];

  return (
    <nav
      aria-label="Primary"
      className={cn("hidden w-60 shrink-0 border-r border-border bg-surface lg:block", className)}
    >
      <div className="flex h-16 items-center px-6 font-semibold text-emerald-800 text-lg">{t.appName}</div>
      <ul className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary",
                  isActive && "bg-primary-50 text-primary-700 hover:bg-primary-50 hover:text-primary-700 font-bold"
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
              {t.navAdmin}
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}

