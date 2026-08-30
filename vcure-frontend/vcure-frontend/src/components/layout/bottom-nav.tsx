"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, MessageCircle, BarChart3, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Meals", href: "/meals", icon: UtensilsCrossed },
  { label: "Coach", href: "/ai", icon: MessageCircle },
  { label: "Progress", href: "/progress", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-200 bg-white shadow-lg">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
              isActive ? "text-emerald-600 font-semibold" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon className={`h-5 w-5 mb-0.5 ${isActive ? "text-emerald-600 stroke-[2.5]" : "text-gray-400 stroke-[1.75]"}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
