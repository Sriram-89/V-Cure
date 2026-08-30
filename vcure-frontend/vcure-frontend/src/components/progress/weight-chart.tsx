"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TrendLineChart } from "@/components/progress/trend-line-chart";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useWeightHistory, useLogWeight } from "@/hooks/use-progress";
import type { DateRangePreset } from "@/types/progress";

export function WeightChart({ range }: { range: DateRangePreset }) {
  const { data, isLoading, isError } = useWeightHistory(range);
  const logWeight = useLogWeight();
  const [isLogging, setIsLogging] = useState(false);
  const [weightInput, setWeightInput] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(weightInput);
    if (!value || value <= 0) return;
    logWeight.mutate(value, {
      onSuccess: () => {
        setWeightInput("");
        setIsLogging(false);
      }
    });
  };

  if (isLoading) return <div className="h-80 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load weight history.</p>;

  return (
    <div>
      <TrendLineChart
        title="Weight"
        data={data.map((entry) => ({ date: entry.date, value: entry.weightKg }))}
        unit=" kg"
        lowerIsBetter
      />
      <div className="mt-3">
        {isLogging ? (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <InputField
                label="Log today's weight (kg)"
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(event) => setWeightInput(event.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" size="sm" isLoading={logWeight.isPending}>
              Save
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsLogging(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => setIsLogging(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Log weight
          </Button>
        )}
      </div>
    </div>
  );
}
