"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/cn";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop }
] as const;

export function ThemeSettingsSection() {
  const { theme, setTheme } = useTheme();
  // next-themes reads localStorage on mount; avoid rendering the active
  // state until mounted to prevent a server/client mismatch flash.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">Theme</h2>
      <p className="mt-1 text-xs text-text-secondary">
        Dark mode support is in progress — the full dark color palette hasn&apos;t been finalized
        in the design system yet, so appearance may be limited until it is.
      </p>

      <div className="mt-4 flex gap-2" role="radiogroup" aria-label="Theme">
        {OPTIONS.map((option) => {
          const isSelected = isMounted && theme === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(option.value)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 rounded-md border border-border px-3 py-3 text-xs font-medium text-text-secondary",
                isSelected && "border-primary bg-primary-50 text-primary-700"
              )}
            >
              <option.icon className="h-4 w-4" aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
