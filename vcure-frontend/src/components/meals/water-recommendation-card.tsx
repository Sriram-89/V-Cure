"use client";

import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDayPlan, useLogWaterIntake } from "@/hooks/use-meals";
import { useMealPlannerStore } from "@/store/meal-planner-store";

const QUICK_ADD_ML = [250, 500];

export function WaterRecommendationCard() {
  const selectedDate = useMealPlannerStore((state) => state.selectedDate);
  const { data, isLoading } = useDayPlan(selectedDate);
  const logWater = useLogWaterIntake(selectedDate);

  if (isLoading || !data) {
    return <div className="h-32 animate-pulse rounded-card bg-surface-muted" />;
  }

  const percent = Math.min(100, Math.round((data.waterLoggedMl / data.waterTargetMl) * 100));

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Droplets className="h-4 w-4 text-secondary" aria-hidden="true" />
          Water intake
        </h2>
        <span className="text-sm text-text-secondary">
          {data.waterLoggedMl} / {data.waterTargetMl} ml
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-secondary transition-all"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="mt-4 flex gap-2">
        {QUICK_ADD_ML.map((amount) => (
          <Button
            key={amount}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => logWater.mutate(amount)}
            isLoading={logWater.isPending}
          >
            +{amount}ml
          </Button>
        ))}
      </div>
    </div>
  );
}
