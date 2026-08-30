"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  BookOpen,
  FileText,
  Video,
  BarChart3,
  ScrollText,
  SlidersHorizontal,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";

const NAV_ITEMS = [
  { label: "Overview", href: ROUTES.ADMIN, icon: LayoutDashboard },
  { label: "Users", href: `${ROUTES.ADMIN}/users`, icon: Users },
  { label: "Foods", href: `${ROUTES.ADMIN}/content?type=FOOD`, icon: UtensilsCrossed },
  { label: "Recipes", href: `${ROUTES.ADMIN}/content?type=RECIPE`, icon: BookOpen },
  { label: "Articles", href: `${ROUTES.ADMIN}/content?type=ARTICLE`, icon: FileText },
  { label: "Videos", href: `${ROUTES.ADMIN}/content?type=VIDEO`, icon: Video },
  { label: "Analytics", href: `${ROUTES.ADMIN}/analytics`, icon: BarChart3 },
  { label: "Audit Logs", href: `${ROUTES.ADMIN}/audit-logs`, icon: ScrollText },
  { label: "Settings", href: `${ROUTES.ADMIN}/settings`, icon: SlidersHorizontal }
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin navigation"
      className={cn("hidden w-60 shrink-0 border-r border-border bg-surface lg:block", className)}
    >
      <div className="flex h-16 items-center px-6 font-semibold">Admin</div>
      <ul className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href.split("?")[0];
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
      </ul>

      <div className="mt-4 border-t border-border px-3 pt-3">
        <Link
          href={ROUTES.DASHBOARD}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-muted"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to app
        </Link>
      </div>
    </nav>
  );
}
