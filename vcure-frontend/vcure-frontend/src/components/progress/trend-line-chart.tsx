"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { computeTrend } from "@/lib/progress-calculations";
import { cn } from "@/lib/cn";

export function TrendLineChart({
  title,
  data,
  valueKey,
  unit,
  formatValue,
  lowerIsBetter = false
}: {
  title: string;
  data: { date: string; value: number }[];
  valueKey?: string;
  unit: string;
  formatValue?: (value: number) => string;
  lowerIsBetter?: boolean;
}) {
  const trend = computeTrend(data.map((d) => d.value));
  const isGood =
    trend.direction === "flat" ? null : lowerIsBetter ? trend.direction === "down" : trend.direction === "up";

  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value: point.value
  }));

  if (data.length < 2) {
    return (
      <div className="rounded-card border border-border bg-surface p-6 shadow-card">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <p className="mt-6 py-8 text-center text-sm text-text-secondary">
          Not enough data yet for this range.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isGood === null ? "text-text-secondary" : isGood ? "text-primary" : "text-danger"
          )}
        >
          {trend.direction === "up" ? (
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : trend.direction === "down" ? (
            <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {trend.delta > 0 ? "+" : ""}
          {formatValue ? formatValue(trend.delta) : trend.delta}
          {unit}
        </span>
      </div>
      <div className="mt-4 h-56" role="img" aria-label={`${title} trend over time`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 11 }} stroke="#64748b" domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }} />
            <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
