"use client";

import { Crown, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getPlan } from "@/constants/plans";
import { useSubscription } from "@/hooks/use-premium";

export function CurrentPlanCard() {
  const { data, isLoading, isError, refetch, isRefetching } = useSubscription();

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-card bg-surface-muted" />;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-6 text-center shadow-card">
        <AlertCircle className="h-6 w-6 text-danger" aria-hidden="true" />
        <p className="text-sm text-text-secondary">Couldn&apos;t load your subscription.</p>
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

  const plan = getPlan(data.planCode);
  const isExpired = data.status === "EXPIRED";

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Crown className="h-4 w-4 text-secondary" aria-hidden="true" />
          Current plan
        </h2>
        {data.status === "ACTIVE" ? (
          <Badge variant="primary">Active</Badge>
        ) : isExpired ? (
          <Badge variant="secondary">Expired</Badge>
        ) : (
          <Badge variant="neutral">Free</Badge>
        )}
      </div>

      <p className="mt-3 text-xl font-semibold text-text-primary">{plan.name}</p>

      {data.expiresAt ? (
        <p className="mt-1 text-xs text-text-secondary">
          {isExpired ? "Expired on " : "Renews on "}
          {new Date(data.expiresAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </p>
      ) : null}

      {isExpired ? (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-red-50 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Your Premium access has ended. Renew to keep AI Coach and advanced tracking.
        </div>
      ) : null}

      <ul className="mt-4 flex flex-col gap-2">
        {data.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-text-primary">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
