"use client";

import { Users, IndianRupee, CreditCard, FileWarning, Activity, AlertCircle } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { useAdminDashboardSummary } from "@/hooks/use-admin";

export function AdminKpiCards() {
  const { data, isLoading, isError, refetch, isRefetching } = useAdminDashboardSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-card bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-6 text-center shadow-card">
        <AlertCircle className="h-6 w-6 text-danger" aria-hidden="true" />
        <p className="text-sm text-text-secondary">Couldn&apos;t load dashboard summary.</p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="text-sm font-medium text-primary hover:underline"
        >
          {isRefetching ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Users" value={String(data.userCount)} icon={Users} />
      <StatCard label="Revenue" value={`₹${data.revenue.toLocaleString()}`} icon={IndianRupee} tone="secondary" />
      <StatCard label="Subscriptions" value={String(data.subscriptionCount)} icon={CreditCard} />
      <StatCard label="Reports" value={String(data.reportCount)} icon={FileWarning} tone="secondary" />
      <div className="rounded-card border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">System status</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-primary">
            <Activity className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <div className="mt-3">
          <Badge variant={data.systemStatus === "OPERATIONAL" ? "primary" : "secondary"}>
            {data.systemStatus === "OPERATIONAL"
              ? "Operational"
              : data.systemStatus === "DEGRADED"
                ? "Degraded"
                : "Down"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
