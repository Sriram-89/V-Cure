"use client";

import { cn } from "@/lib/cn";
import type { DateRangePreset } from "@/types/progress";

const RANGES: { value: DateRangePreset; label: string }[] = [
  { value: "7D", label: "7D" },
  { value: "30D", label: "30D" },
  { value: "90D", label: "90D" },
  { value: "1Y", label: "1Y" }
];

export function DateRangeSelector({
  range,
  onChange
}: {
  range: DateRangePreset;
  onChange: (range: DateRangePreset) => void;
}) {
  return (
    <div role="tablist" aria-label="Date range" className="flex gap-1 rounded-md bg-surface-muted p-1">
      {RANGES.map((option) => {
        const isActive = range === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              isActive ? "bg-surface text-primary shadow-card" : "text-text-secondary"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
