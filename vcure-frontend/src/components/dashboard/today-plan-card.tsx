"use client";

import { UtensilsCrossed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TodayMealDto } from "@/types/dashboard";
import { useTranslation } from "@/hooks/use-translation";

function safetyBadgeVariant(status: TodayMealDto["safetyStatus"]) {
  if (status === "SAFE") return "primary" as const;
  if (status === "FLAGGED") return "secondary" as const;
  return "neutral" as const;
}

export function TodayPlanCard({ meals }: { meals: TodayMealDto[] }) {
  const { t } = useTranslation();

  const slotLabels: Record<TodayMealDto["slot"], string> = {
    BREAKFAST: t.breakfast,
    LUNCH: t.lunch,
    DINNER: t.dinner,
    SNACK: t.snack
  };

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">{t.todaysMealPlanTitle}</h2>

      {meals.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
          <UtensilsCrossed className="h-8 w-8 text-text-secondary" aria-hidden="true" />
          <p className="text-sm text-text-secondary">
            {t.todaysMealPlanSubtitle}
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {meals.map((meal) => (
            <li
              key={meal.id}
              className="flex items-center justify-between rounded-md bg-surface-muted p-3"
            >
              <div>
                <p className="text-xs text-text-secondary font-bold">{slotLabels[meal.slot] || meal.slot}</p>
                <p className="text-sm font-medium text-text-primary">{meal.name}</p>
              </div>
              <Badge variant={safetyBadgeVariant(meal.safetyStatus)}>
                {meal.safetyStatus === "SAFE"
                  ? "Safe"
                  : meal.safetyStatus === "FLAGGED"
                    ? meal.safetyNote ?? "Flagged"
                    : "Blocked"}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

