"use client";

import { CheckCircle2 } from "lucide-react";
import { useProfileCompletion } from "@/hooks/use-profile";

export function ProfileCompletionSummary() {
  const { data, isLoading } = useProfileCompletion();

  if (isLoading) {
    return <div className="h-20 animate-pulse rounded-card bg-surface-muted" />;
  }

  if (!data) return null;

  const isComplete = data.percentage >= 100;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Profile completeness</h2>
          <p className="mt-1 text-xs text-text-secondary">
            {isComplete
              ? "Your profile is fully set up."
              : `${data.missingSections.length} section${data.missingSections.length === 1 ? "" : "s"} left to complete.`}
          </p>
        </div>
        {isComplete ? (
          <CheckCircle2 className="h-6 w-6 text-primary" aria-hidden="true" />
        ) : (
          <span className="text-lg font-semibold text-text-primary">{data.percentage}%</span>
        )}
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${data.percentage}%` }}
          role="progressbar"
          aria-valuenow={data.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
