"use client";

import { UtensilsCrossed } from "lucide-react";
import { useMealTrackingHistory } from "@/hooks/use-progress";
import type { DateRangePreset } from "@/types/progress";
import type { MealSlot } from "@/types/meals";

const SLOT_LABELS: Record<MealSlot, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snacks"
};

export function MealTrackingSummary({ range }: { range: DateRangePreset }) {
  const { data, isLoading, isError } = useMealTrackingHistory(range);

  if (isLoading) return <div className="h-40 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load meal tracking.</p>;

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border py-10 text-center">
        <UtensilsCrossed className="h-6 w-6 text-text-secondary" aria-hidden="true" />
        <p className="text-sm text-text-secondary">No meal tracking data for this range yet.</p>
      </div>
    );
  }

  const slots: MealSlot[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
  const bySlot = slots.map((slot) => {
    const entries = data.filter((entry) => entry.slot === slot);
    const loggedCount = entries.filter((entry) => entry.wasLogged).length;
    const percent = entries.length > 0 ? Math.round((loggedCount / entries.length) * 100) : 0;
    return { slot, percent, loggedCount, total: entries.length };
  });

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">Meal tracking</h2>
      <div className="mt-4 flex flex-col gap-3">
        {bySlot.map((row) => (
          <div key={row.slot}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-primary">{SLOT_LABELS[row.slot]}</span>
              <span className="text-text-secondary">
                {row.loggedCount}/{row.total} logged
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${row.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
