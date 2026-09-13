"use client";

import { AlertCircle, Users, Repeat, UtensilsCrossed, ThumbsUp } from "lucide-react";
import { Container } from "@/components/ui/container";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendLineChart } from "@/components/progress/trend-line-chart";
import { useAdminAnalytics } from "@/hooks/use-admin";

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError, refetch, isRefetching } = useAdminAnalytics();

  return (
    <Container className="max-w-5xl py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Analytics</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Exactly the metrics API 75 documents (GET /api/v1/admin/analytics).
      </p>

      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-card bg-surface-muted" />
          ))}
        </div>
      ) : isError || !data ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-6 text-center shadow-card">
          <AlertCircle className="h-6 w-6 text-danger" aria-hidden="true" />
          <p className="text-sm text-text-secondary">Couldn&apos;t load analytics.</p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="text-sm font-medium text-primary hover:underline"
          >
            {isRefetching ? "Retrying..." : "Retry"}
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Monthly active users" value={data.monthlyActiveUsers.toLocaleString()} icon={Users} />
            <StatCard label="Retention" value={`${data.retentionPercent}%`} icon={Repeat} tone="secondary" />
            <StatCard label="Meal completion" value={`${data.mealCompletionPercent}%`} icon={UtensilsCrossed} />
            <StatCard
              label="Recommendation acceptance"
              value={`${data.recommendationAcceptancePercent}%`}
              icon={ThumbsUp}
              tone="secondary"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <TrendLineChart
              title="Daily active users"
              data={data.dailyActiveUsers.map((d) => ({ date: d.date, value: d.value }))}
              unit=""
            />
            <TrendLineChart
              title="Health score trend"
              data={data.healthScoreTrend.map((d) => ({ date: d.date, value: d.value }))}
              unit=" pts"
            />
          </div>
        </>
      )}
    </Container>
  );
}
