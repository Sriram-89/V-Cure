"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { MealSearchBar } from "@/components/meals/meal-search-bar";
import { MealFiltersBar } from "@/components/meals/meal-filters-bar";
import { MealCard } from "@/components/meals/meal-card";
import { MealListSkeleton } from "@/components/meals/meal-skeletons";
import { useMealSearch, useToggleFavorite } from "@/hooks/use-meals";
import { useMealPlannerStore } from "@/store/meal-planner-store";

export function MealSearchSection() {
  const openMeal = useMealPlannerStore((state) => state.openMeal);
  const filters = useMealPlannerStore((state) => state.filters);
  const setFilters = useMealPlannerStore((state) => state.setFilters);
  const [query, setQuery] = useState("");
  const toggleFavorite = useToggleFavorite();

  const { data, isLoading, isError } = useMealSearch({ ...filters, query });

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">Search meals</h2>
      <div className="mt-4 flex flex-col gap-3">
        <MealSearchBar value={query} onChange={setQuery} />
        <MealFiltersBar filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <MealListSkeleton />
        ) : isError || !data ? (
          <p className="text-sm text-danger">Search failed. Try again.</p>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Search className="h-6 w-6 text-text-secondary" aria-hidden="true" />
            <p className="text-sm text-text-secondary">No meals match your search or filters.</p>
          </div>
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
    </div>
  );
}
