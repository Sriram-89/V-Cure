"use client";

import { TrendLineChart } from "@/components/progress/trend-line-chart";
import { useBmiHistory } from "@/hooks/use-progress";
import type { DateRangePreset } from "@/types/progress";

export function BmiChart({ range }: { range: DateRangePreset }) {
  const { data, isLoading, isError } = useBmiHistory(range);

  if (isLoading) return <div className="h-80 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load BMI history.</p>;

  return (
    <TrendLineChart
      title="BMI"
      data={data.map((entry) => ({ date: entry.date, value: entry.bmi }))}
      unit=""
    />
  );
}
