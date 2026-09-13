"use client";

import { Search, Heart, History } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { RecipeCategories } from "@/components/recipes/recipe-categories";
import { RecipeSearchFilters } from "@/components/recipes/recipe-search-filters";
import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeGridSkeleton } from "@/components/recipes/recipe-skeleton";
import { cn } from "@/lib/cn";
import {
  useRecommendedRecipes,
  useRecipesByCategory,
  useRecipeSearch,
  useFavoriteRecipes,
  useRecentlyViewedRecipes,
  useToggleFavoriteRecipe
} from "@/hooks/use-recipes";
import { useRecipeStore } from "@/store/recipe-store";

function RecipeGrid({
  recipes,
  isLoading,
  isError,
  emptyLabel,
  onToggleFavorite
}: {
  recipes: ReturnType<typeof useRecommendedRecipes>["data"];
  isLoading: boolean;
  isError: boolean;
  emptyLabel: string;
  onToggleFavorite: (id: string) => void;
}) {
  if (isLoading) return <RecipeGridSkeleton />;
  if (isError || !recipes) return <p className="text-sm text-danger">Couldn&apos;t load recipes.</p>;
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border py-10 text-center">
        <Search className="h-6 w-6 text-text-secondary" aria-hidden="true" />
        <p className="text-sm text-text-secondary">{emptyLabel}</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  );
}

export default function RecipeHomePage() {
  const activeCategory = useRecipeStore((state) => state.activeCategory);
  const setActiveCategory = useRecipeStore((state) => state.setActiveCategory);
  const filters = useRecipeStore((state) => state.filters);
  const setFilters = useRecipeStore((state) => state.setFilters);
  const [tab, setTab] = useState<"favorites" | "recent">("favorites");

  const toggleFavorite = useToggleFavoriteRecipe();
  const recommended = useRecommendedRecipes();
  const byCategory = useRecipesByCategory(activeCategory);
  const searchResults = useRecipeSearch(filters);
  const favorites = useFavoriteRecipes();
  const recentlyViewed = useRecentlyViewedRecipes();

  const hasActiveFilters = Boolean(filters.query || filters.difficulty || filters.dietTag || filters.maxCookingTimeMinutes);
  const primaryList = hasActiveFilters ? searchResults : activeCategory ? byCategory : recommended;

  const sideTab = tab === "favorites" ? favorites : recentlyViewed;

  return (
    <Container className="max-w-5xl py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Recipes</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Browse, save, and cook meals that fit your plan.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <RecipeCategories activeCategory={activeCategory} onSelect={setActiveCategory} />

          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <RecipeSearchFilters filters={filters} onChange={setFilters} />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-text-primary">
              {hasActiveFilters ? "Search results" : activeCategory ? activeCategory : "Recommended for you"}
            </h2>
            <RecipeGrid
              recipes={primaryList.data}
              isLoading={primaryList.isLoading}
              isError={primaryList.isError}
              emptyLabel="No recipes match right now."
              onToggleFavorite={(id) => toggleFavorite.mutate(id)}
            />
          </div>
        </div>

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

          <div className="mt-4 flex flex-col gap-3">
            {sideTab.isLoading ? (
              <RecipeGridSkeleton count={2} />
            ) : sideTab.isError || !sideTab.data ? (
              <p className="text-sm text-danger">Couldn&apos;t load this list.</p>
            ) : sideTab.data.length === 0 ? (
              <p className="py-4 text-sm text-text-secondary">
                {tab === "favorites"
                  ? "Recipes you save will show up here."
                  : "Recipes you view will show up here."}
              </p>
            ) : (
              sideTab.data.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onToggleFavorite={(id) => toggleFavorite.mutate(id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
