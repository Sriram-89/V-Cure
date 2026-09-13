"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useNutritionProgress } from "@/hooks/use-progress";
import type { DateRangePreset } from "@/types/progress";

export function NutritionProgressChart({ range }: { range: DateRangePreset }) {
  const { data, isLoading, isError } = useNutritionProgress(range);

  if (isLoading) return <div className="h-80 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load nutrition progress.</p>;

  const chartData = data.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    Protein: entry.macros.proteinG,
    Carbs: entry.macros.carbsG,
    Fat: entry.macros.fatG
  }));

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">Nutrition progress</h2>
      <div className="mt-4 h-64" role="img" aria-label="Daily macro grams over time">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }} />
            <Legend
              iconType="circle"
              formatter={(value) => <span className="text-xs text-text-secondary">{value}</span>}
            />
            <Area type="monotone" dataKey="Protein" stackId="1" stroke="#059669" fill="#059669" fillOpacity={0.3} />
            <Area type="monotone" dataKey="Carbs" stackId="1" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
            <Area type="monotone" dataKey="Fat" stackId="1" stroke="#d97706" fill="#d97706" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
