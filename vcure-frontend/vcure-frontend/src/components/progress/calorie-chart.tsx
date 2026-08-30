"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { average } from "@/lib/progress-calculations";
import { useCalorieHistory } from "@/hooks/use-progress";
import type { DateRangePreset } from "@/types/progress";

export function CalorieChart({ range }: { range: DateRangePreset }) {
  const { data, isLoading, isError } = useCalorieHistory(range);

  if (isLoading) return <div className="h-80 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load calorie history.</p>;

  const avgTarget = average(data.map((entry) => entry.targetCalories));
  const chartData = data.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    consumed: entry.consumedCalories
  }));

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Calorie tracking</h2>
        <span className="text-xs text-text-secondary">Target: {avgTarget} kcal/day</span>
      </div>
      <div className="mt-4 h-56" role="img" aria-label="Daily calories consumed vs target">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }} />
            <ReferenceLine y={avgTarget} stroke="#2563eb" strokeDasharray="4 4" />
            <Bar dataKey="consumed" fill="#059669" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
