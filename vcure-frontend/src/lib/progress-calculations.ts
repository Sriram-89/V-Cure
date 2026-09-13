import type { DateRangePreset } from "@/types/progress";

export function rangeToDays(range: DateRangePreset): number {
  switch (range) {
    case "7D":
      return 7;
    case "30D":
      return 30;
    case "90D":
      return 90;
    case "1Y":
      return 365;
  }
}

export interface TrendResult {
  delta: number;
  percentChange: number | null;
  direction: "up" | "down" | "flat";
}

export function computeTrend(series: number[]): TrendResult {
  if (series.length < 2) {
    return { delta: 0, percentChange: null, direction: "flat" };
  }
  const first = series[0] ?? 0;
  const last = series[series.length - 1] ?? 0;
  const delta = Number((last - first).toFixed(1));
  const percentChange = first !== 0 ? Number(((delta / first) * 100).toFixed(1)) : null;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  return { delta, percentChange, direction };
}

export function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1));
}

export function groupByWeek<T extends { date: string }>(entries: T[]): Record<string, T[]> {
  return entries.reduce<Record<string, T[]>>((groups, entry) => {
    const date = new Date(entry.date);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    groups[key] = groups[key] ? [...groups[key], entry] : [entry];
    return groups;
  }, {});
}

export function groupByMonth<T extends { date: string }>(entries: T[]): Record<string, T[]> {
  return entries.reduce<Record<string, T[]>>((groups, entry) => {
    const key = entry.date.slice(0, 7); // YYYY-MM
    groups[key] = groups[key] ? [...groups[key], entry] : [entry];
    return groups;
  }, {});
}

export function computeGoalPercent(current: number, start: number, target: number): number {
  if (target === start) return 100;
  const percent = ((current - start) / (target - start)) * 100;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

export function computeAdherencePercent(consumed: number, target: number): number {
  if (target === 0) return 0;
  return Math.max(0, Math.min(100, Math.round((consumed / target) * 100)));
}
