"use client";

import { Droplets } from "lucide-react";
import { average, computeAdherencePercent } from "@/lib/progress-calculations";
import { useWaterHistory } from "@/hooks/use-progress";
import type { DateRangePreset } from "@/types/progress";

export function WaterProgress({ range }: { range: DateRangePreset }) {
  const { data, isLoading, isError } = useWaterHistory(range);

  if (isLoading) return <div className="h-32 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load water intake history.</p>;

  const avgLogged = average(data.map((entry) => entry.loggedMl));
  const avgTarget = average(data.map((entry) => entry.targetMl));
  const percent = computeAdherencePercent(avgLogged, avgTarget);

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Droplets className="h-4 w-4 text-secondary" aria-hidden="true" />
        Water intake
      </h2>
      <p className="mt-1 text-xs text-text-secondary">Daily average over this range</p>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-text-secondary">{Math.round(avgLogged)} / {Math.round(avgTarget)} ml</span>
        <span className="font-medium text-text-primary">{percent}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-secondary transition-all"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
