"use client";

import { Heart, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { MealSummary } from "@/types/meals";

function safetyBadgeVariant(status: MealSummary["safetyStatus"]) {
  if (status === "SAFE") return "primary" as const;
  if (status === "FLAGGED") return "secondary" as const;
  return "neutral" as const;
}

export function MealCard({
  meal,
  onSelect,
  onToggleFavorite
}: {
  meal: MealSummary;
  onSelect: (mealId: string) => void;
  onToggleFavorite?: (mealId: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 shadow-card">
      <button
        type="button"
        onClick={() => onSelect(meal.id)}
        className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
      >
        <span className="truncate text-sm font-medium text-text-primary">{meal.name}</span>
        <span className="flex items-center gap-1 text-xs text-text-secondary">
          <Flame className="h-3 w-3" aria-hidden="true" />
          {meal.calories} kcal
        </span>
        <div className="flex flex-wrap gap-1">
          <Badge variant={safetyBadgeVariant(meal.safetyStatus)}>
            {meal.safetyStatus === "SAFE"
              ? "Safe"
              : meal.safetyStatus === "FLAGGED"
                ? meal.safetyNote ?? "Flagged"
                : "Blocked"}
          </Badge>
        </div>
      </button>

      {onToggleFavorite ? (
        <button
          type="button"
          aria-label={meal.isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={meal.isFavorite}
          onClick={() => onToggleFavorite(meal.id)}
          className="shrink-0 rounded-full p-2 hover:bg-surface-muted"
        >
          <Heart
            className={cn("h-4 w-4", meal.isFavorite ? "fill-danger text-danger" : "text-text-secondary")}
            aria-hidden="true"
          />
        </button>
      ) : null}
    </div>
  );
}
