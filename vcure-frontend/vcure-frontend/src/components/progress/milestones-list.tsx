"use client";

import { Trophy, Circle } from "lucide-react";
import { useMilestones } from "@/hooks/use-progress";

export function MilestonesList() {
  const { data, isLoading, isError } = useMilestones();

  if (isLoading) return <div className="h-48 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load milestones.</p>;

  if (data.length === 0) {
    return <p className="text-sm text-text-secondary">No milestones defined yet.</p>;
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">Milestones</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {data.map((milestone) => (
          <li key={milestone.id} className="flex items-start gap-3">
            {milestone.isAchieved ? (
              <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-border" aria-hidden="true" />
            )}
            <div>
              <p
                className={
                  milestone.isAchieved
                    ? "text-sm font-medium text-text-primary"
                    : "text-sm font-medium text-text-secondary"
                }
              >
                {milestone.title}
              </p>
              <p className="text-xs text-text-secondary">{milestone.description}</p>
              {milestone.isAchieved && milestone.achievedDate ? (
                <p className="mt-0.5 text-xs text-text-secondary">Achieved {milestone.achievedDate}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
