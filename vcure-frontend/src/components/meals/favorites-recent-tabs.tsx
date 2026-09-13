"use client";

import { useState } from "react";
import { Heart, History } from "lucide-react";
import { cn } from "@/lib/cn";
import { MealCard } from "@/components/meals/meal-card";
import { MealListSkeleton } from "@/components/meals/meal-skeletons";
import { useFavoriteMeals, useRecentMeals, useToggleFavorite } from "@/hooks/use-meals";
import { useMealPlannerStore } from "@/store/meal-planner-store";

export function FavoritesRecentTabs() {
  const [tab, setTab] = useState<"favorites" | "recent">("favorites");
  const openMeal = useMealPlannerStore((state) => state.openMeal);
  const favorites = useFavoriteMeals();
  const recent = useRecentMeals();
  const toggleFavorite = useToggleFavorite();

  const active = tab === "favorites" ? favorites : recent;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div role="tablist" className="flex gap-1 rounded-md bg-surface-muted p-1">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "favorites"}
          onClick={() => setTab("favorites")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium",
            tab === "favorites" ? "bg-surface text-primary shadow-card" : "text-text-secondary"
          )}
        >
          <Heart className="h-3.5 w-3.5" aria-hidden="true" />
          Favorites
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "recent"}
          onClick={() => setTab("recent")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium",
            tab === "recent" ? "bg-surface text-primary shadow-card" : "text-text-secondary"
          )}
        >
          <History className="h-3.5 w-3.5" aria-hidden="true" />
          Recent
        </button>
      </div>

      <div className="mt-4">
        {active.isLoading ? (
          <MealListSkeleton />
        ) : active.isError || !active.data ? (
          <p className="text-sm text-danger">Couldn&apos;t load this list.</p>
        ) : active.data.length === 0 ? (
          <p className="py-4 text-sm text-text-secondary">
            {tab === "favorites"
              ? "Meals you favorite will show up here."
              : "Meals you log will show up here."}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {active.data.map((meal) => (
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
    </div>
  );
}
