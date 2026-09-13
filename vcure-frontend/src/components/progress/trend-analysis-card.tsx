"use client";

import { Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/cn";
import { average, computeTrend } from "@/lib/progress-calculations";
import { useWeightHistory, useCalorieHistory } from "@/hooks/use-progress";

function DeltaBadge({ delta, unit, lowerIsBetter }: { delta: number; unit: string; lowerIsBetter: boolean }) {
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const isGood = direction === "flat" ? null : lowerIsBetter ? direction === "down" : direction === "up";

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs font-medium",
        isGood === null ? "text-text-secondary" : isGood ? "text-primary" : "text-danger"
      )}
    >
      {direction === "up" ? (
        <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
      ) : direction === "down" ? (
        <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {delta > 0 ? "+" : ""}
      {delta}
      {unit}
    </span>
  );
}

export function TrendAnalysisCard() {
  const weekly = useWeightHistory("7D");
  const monthly = useWeightHistory("30D");
  const weeklyCalories = useCalorieHistory("7D");
  const monthlyCalories = useCalorieHistory("30D");

  const isLoading = weekly.isLoading || monthly.isLoading || weeklyCalories.isLoading || monthlyCalories.isLoading;
  const isError = weekly.isError || monthly.isError || weeklyCalories.isError || monthlyCalories.isError;

  if (isLoading) return <div className="h-48 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !weekly.data || !monthly.data || !weeklyCalories.data || !monthlyCalories.data) {
    return <p className="text-sm text-danger">Couldn&apos;t load trend analysis.</p>;
  }

  const weeklyWeightTrend = computeTrend(weekly.data.map((entry) => entry.weightKg));
  const monthlyWeightTrend = computeTrend(monthly.data.map((entry) => entry.weightKg));
  const weeklyAvgCalories = average(weeklyCalories.data.map((entry) => entry.consumedCalories));
  const monthlyAvgCalories = average(monthlyCalories.data.map((entry) => entry.consumedCalories));

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        Trend analysis
      </h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md bg-surface-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">This week</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-text-primary">Weight change</span>
            <DeltaBadge delta={weeklyWeightTrend.delta} unit=" kg" lowerIsBetter />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-text-primary">Avg calories</span>
            <span className="text-xs text-text-secondary">{Math.round(weeklyAvgCalories)} kcal</span>
          </div>
        </div>

        <div className="rounded-md bg-surface-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">This month</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-text-primary">Weight change</span>
            <DeltaBadge delta={monthlyWeightTrend.delta} unit=" kg" lowerIsBetter />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-text-primary">Avg calories</span>
            <span className="text-xs text-text-secondary">{Math.round(monthlyAvgCalories)} kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
