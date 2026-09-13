"use client";

import { Apple } from "lucide-react";
import { useNutritionContext } from "@/hooks/use-ai-chat";

export function NutritionContextPanel() {
  const { data, isLoading, isError } = useNutritionContext();

  if (isLoading) return <div className="h-32 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load nutrition context.</p>;

  const percent = Math.min(100, Math.round((data.today.calories / data.calorieTargetToday) * 100));

  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        <Apple className="h-3.5 w-3.5" aria-hidden="true" />
        Today so far
      </h2>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-text-secondary">Calories</span>
        <span className="font-medium text-text-primary">
          {data.today.calories} / {data.calorieTargetToday}
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md bg-surface-muted p-2">
          <dt className="text-text-secondary">Protein</dt>
          <dd className="font-semibold text-text-primary">{data.today.macros.proteinG}g</dd>
        </div>
        <div className="rounded-md bg-surface-muted p-2">
          <dt className="text-text-secondary">Carbs</dt>
          <dd className="font-semibold text-text-primary">{data.today.macros.carbsG}g</dd>
        </div>
        <div className="rounded-md bg-surface-muted p-2">
          <dt className="text-text-secondary">Fat</dt>
          <dd className="font-semibold text-text-primary">{data.today.macros.fatG}g</dd>
        </div>
      </dl>
    </div>
  );
}
