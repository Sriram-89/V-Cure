"use client";

import { Scale, HeartPulse, Flame, Trophy } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { useProgressSummary } from "@/hooks/use-progress";

export function ProgressSummaryCards() {
  const { data, isLoading, isError } = useProgressSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-card bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <p className="text-sm text-danger">Couldn&apos;t load your progress summary.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <StatCard label="Current weight" value={`${data.currentWeightKg} kg`} icon={Scale} />
      <StatCard label="Current BMI" value={data.currentBmi.toFixed(1)} icon={HeartPulse} tone="secondary" />
      <StatCard
        label="Health score"
        value={`${data.healthScore}/100`}
        hint="Based on recent adherence"
        icon={Trophy}
      />
      <StatCard
        label="Current streak"
        value={`${data.streakDays} ${data.streakDays === 1 ? "day" : "days"}`}
        hint={`${data.weeklyCalorieAdherencePercent}% calorie adherence this week`}
        icon={Flame}
        tone="secondary"
      />
    </div>
  );
}
