"use client";

import { MealCard } from "@/components/meals/meal-card";
import { MealListSkeleton } from "@/components/meals/meal-skeletons";
import { useRecommendedMeals, useToggleFavorite } from "@/hooks/use-meals";
import { useMealPlannerStore } from "@/store/meal-planner-store";
import type { MealSlot } from "@/types/meals";

export function RecommendedMealsSection({ slot }: { slot: MealSlot }) {
  const openMeal = useMealPlannerStore((state) => state.openMeal);
  const { data, isLoading, isError } = useRecommendedMeals(slot);
  const toggleFavorite = useToggleFavorite();

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-text-primary">Recommended for you</h2>
      {isLoading ? (
        <MealListSkeleton />
      ) : isError || !data ? (
        <p className="text-sm text-danger">Couldn&apos;t load recommendations.</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-text-secondary">No recommendations available right now.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onSelect={openMeal}
              onToggleFavorite={(id) => toggleFavorite.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
