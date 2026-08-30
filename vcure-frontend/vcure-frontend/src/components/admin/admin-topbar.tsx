"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export function AdminTopBar() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-surface px-4 lg:px-8">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md lg:hidden"
        aria-label={isMobileNavOpen ? "Close admin menu" : "Open admin menu"}
        aria-expanded={isMobileNavOpen}
        onClick={() => setIsMobileNavOpen((prev) => !prev)}
      >
        {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <span className="text-sm font-semibold text-text-primary lg:hidden">Admin</span>
      <span className="hidden text-sm text-text-secondary lg:block">Privileged area — admin only</span>

      {isMobileNavOpen ? (
        <div className="absolute left-0 top-16 w-full border-b border-border bg-surface lg:hidden">
          <AdminSidebar key={pathname} className="block w-full border-r-0" />
        </div>
      ) : null}
    </header>
  );
}
