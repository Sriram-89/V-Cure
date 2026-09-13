"use client";

import { cn } from "@/lib/cn";
import type { MealSlot } from "@/types/meals";

const SLOTS: { value: MealSlot; label: string }[] = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "SNACK", label: "Snacks" }
];

export function SlotTabs({
  activeSlot,
  onChange
}: {
  activeSlot: MealSlot;
  onChange: (slot: MealSlot) => void;
}) {
  return (
    <div role="tablist" aria-label="Meal slot" className="flex gap-1 rounded-md bg-surface-muted p-1">
      {SLOTS.map((slot) => {
        const isActive = activeSlot === slot.value;
        return (
          <button
            key={slot.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(slot.value)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-surface text-primary shadow-card" : "text-text-secondary"
            )}
          >
            {slot.label}
          </button>
        );
      })}
    </div>
  );
}
