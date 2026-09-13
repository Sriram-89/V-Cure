"use client";

import { X, Heart, Flame, Scale, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MacroDistributionChart } from "@/components/meals/macro-distribution-chart";
import { MicronutrientsList } from "@/components/meals/micronutrients-list";
import { AiExplanationCard } from "@/components/meals/ai-explanation-card";
import { AlternativeMealsList } from "@/components/meals/alternative-meals-list";
import { cn } from "@/lib/cn";
import { useMealDetail, useToggleFavorite, useLogMealConsumed } from "@/hooks/use-meals";
import { useMealPlannerStore } from "@/store/meal-planner-store";

function safetyBadgeVariant(status: string) {
  if (status === "SAFE") return "primary" as const;
  if (status === "FLAGGED") return "secondary" as const;
  return "neutral" as const;
}

export function MealDetailsPanel() {
  const selectedMealId = useMealPlannerStore((state) => state.selectedMealId);
  const selectedDate = useMealPlannerStore((state) => state.selectedDate);
  const closeMeal = useMealPlannerStore((state) => state.closeMeal);
  const openMeal = useMealPlannerStore((state) => state.openMeal);

  const { data: meal, isLoading, isError } = useMealDetail(selectedMealId);
  const toggleFavorite = useToggleFavorite();
  const logConsumed = useLogMealConsumed(selectedDate);

  if (!selectedMealId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close meal details"
        className="absolute inset-0"
        onClick={closeMeal}
      />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-surface p-6 shadow-modal">
        <button
          type="button"
          aria-label="Close"
          onClick={closeMeal}
          className="absolute right-4 top-4 rounded-md p-1.5 text-text-secondary hover:bg-surface-muted"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {isLoading ? (
          <div className="mt-10 space-y-3">
            <div className="h-6 w-2/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-40 animate-pulse rounded-card bg-surface-muted" />
          </div>
        ) : isError || !meal ? (
          <p className="mt-10 text-sm text-danger">Couldn&apos;t load meal details.</p>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            <div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-text-primary">{meal.name}</h2>
                <button
                  type="button"
                  aria-label={meal.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  aria-pressed={meal.isFavorite}
                  onClick={() => toggleFavorite.mutate(meal.id)}
                  className="shrink-0 rounded-full p-2 hover:bg-surface-muted"
                >
                  <Heart
                    className={cn("h-5 w-5", meal.isFavorite ? "fill-danger text-danger" : "text-text-secondary")}
                    aria-hidden="true"
                  />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={safetyBadgeVariant(meal.safetyStatus)}>
                  {meal.safetyStatus === "SAFE"
                    ? "Safe"
                    : meal.safetyStatus === "FLAGGED"
                      ? meal.safetyNote ?? "Flagged"
                      : "Blocked"}
                </Badge>
                {meal.dietTags.map((tag) => (
                  <Badge key={tag} variant="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <AiExplanationCard explanation={meal.aiExplanation} />

            <div className="rounded-card border border-border p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                  Nutrition breakdown
                </h3>
                <span className="flex items-center gap-1 text-sm font-medium text-text-primary">
                  <Flame className="h-4 w-4 text-primary" aria-hidden="true" />
                  {meal.nutrition.calories} kcal
                </span>
              </div>
              <MacroDistributionChart macros={meal.nutrition.macros} />
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Micronutrients
              </h3>
              <div className="mt-3">
                <MicronutrientsList micronutrients={meal.nutrition.micronutrients} />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-md bg-surface-muted p-3 text-sm">
              <Scale className="h-4 w-4 text-text-secondary" aria-hidden="true" />
              <span className="text-text-primary">Portion: {meal.portion.description}</span>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                Ingredients
              </h3>
              <p className="mt-2 text-sm text-text-secondary">{meal.ingredients.join(", ")}</p>
            </div>

            <AlternativeMealsList mealId={meal.id} onSelect={openMeal} />

            <Button
              type="button"
              className="w-full"
              onClick={() => logConsumed.mutate(meal.id)}
              isLoading={logConsumed.isPending}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Log as eaten
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
