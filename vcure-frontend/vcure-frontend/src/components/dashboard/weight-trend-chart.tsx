"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import type { WeightTrendPointDto } from "@/types/dashboard";

export function WeightTrendChart({ data }: { data: WeightTrendPointDto[] }) {
  if (data.length < 2) {
    return (
      <div className="rounded-card border border-border bg-surface p-6 shadow-card">
        <h2 className="text-sm font-semibold text-text-primary">Weight trend</h2>
        <p className="mt-6 py-8 text-center text-sm text-text-secondary">
          Log your weight a couple of times to start seeing a trend here.
        </p>
      </div>
    );
  }

  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    }),
    weight: point.weightKg
  }));

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">Weight trend</h2>
      <div className="mt-4 h-64" role="img" aria-label="Weight trend over time">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
            <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
            <Tooltip
              contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
