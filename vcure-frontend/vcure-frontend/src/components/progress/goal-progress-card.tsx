"use client";

import { Target } from "lucide-react";
import { computeGoalPercent } from "@/lib/progress-calculations";
import { useGoalProgress } from "@/hooks/use-progress";

export function GoalProgressCard() {
  const { data, isLoading, isError } = useGoalProgress();

  if (isLoading) return <div className="h-36 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load your goal progress.</p>;

  const percent = computeGoalPercent(data.currentValue, data.startValue, data.targetValue);

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Target className="h-4 w-4" aria-hidden="true" />
        {data.goalLabel}
      </h2>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-text-secondary">
          {data.currentValue} {data.unit}
        </span>
        <span className="text-text-secondary">
          Target: {data.targetValue} {data.unit}
        </span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="mt-2 text-xs text-text-secondary">{percent}% of the way to your goal</p>
    </div>
  );
}
