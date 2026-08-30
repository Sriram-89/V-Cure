"use client";

import { TrendLineChart } from "@/components/progress/trend-line-chart";
import { useHealthScoreHistory } from "@/hooks/use-progress";
import type { DateRangePreset } from "@/types/progress";

export function HealthScoreChart({ range }: { range: DateRangePreset }) {
  const { data, isLoading, isError } = useHealthScoreHistory(range);

  if (isLoading) return <div className="h-80 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load your health score.</p>;

  return (
    <TrendLineChart
      title="Health score"
      data={data.map((entry) => ({ date: entry.date, value: entry.score }))}
      unit=" pts"
    />
  );
}
