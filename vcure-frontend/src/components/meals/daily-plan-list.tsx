"use client";

import { UtensilsCrossed, Check } from "lucide-react";
import { MealCard } from "@/components/meals/meal-card";
import { MealListSkeleton } from "@/components/meals/meal-skeletons";
import { Button } from "@/components/ui/button";
import { useDayPlan, useToggleFavorite, useLogMealConsumed } from "@/hooks/use-meals";
import { useMealPlannerStore } from "@/store/meal-planner-store";
import type { MealSlot } from "@/types/meals";

export function DailyPlanList({ slot }: { slot: MealSlot }) {
  const selectedDate = useMealPlannerStore((state) => state.selectedDate);
  const openMeal = useMealPlannerStore((state) => state.openMeal);
  const { data, isLoading, isError } = useDayPlan(selectedDate);
  const toggleFavorite = useToggleFavorite();
  const logConsumed = useLogMealConsumed(selectedDate);

  if (isLoading) return <MealListSkeleton count={1} />;

  if (isError || !data) {
    return <p className="text-sm text-danger">Couldn&apos;t load today&apos;s plan.</p>;
  }

  const slotMeals = data.meals[slot];

  if (slotMeals.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border py-10 text-center">
        <UtensilsCrossed className="h-6 w-6 text-text-secondary" aria-hidden="true" />
        <p className="text-sm text-text-secondary">
          Nothing planned for this slot yet — check recommendations below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {slotMeals.map((meal) => (
        <div key={meal.id} className="flex items-center gap-2">
          <div className="flex-1">
            <MealCard
              meal={meal}
              onSelect={openMeal}
              onToggleFavorite={(id) => toggleFavorite.mutate(id)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => logConsumed.mutate(meal.id)}
            isLoading={logConsumed.isPending}
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Log
          </Button>
        </div>
      ))}
    </div>
  );
}
