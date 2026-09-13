"use client";

import Link from "next/link";
import { Heart, Clock, Flame, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DifficultyBadge } from "@/components/recipes/difficulty-badge";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import type { RecipeSummary } from "@/types/recipes";

export function RecipeCard({
  recipe,
  onToggleFavorite
}: {
  recipe: RecipeSummary;
  onToggleFavorite?: (recipeId: string) => void;
}) {
  return (
    <div className="flex flex-col rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`${ROUTES.RECIPES}/${recipe.id}`}
          className="min-w-0 flex-1 text-sm font-semibold text-text-primary hover:text-primary"
        >
          {recipe.title}
        </Link>
        {onToggleFavorite ? (
          <button
            type="button"
            aria-label={recipe.isFavorite ? "Remove from favorites" : "Save recipe"}
            aria-pressed={recipe.isFavorite}
            onClick={() => onToggleFavorite(recipe.id)}
            className="shrink-0 rounded-full p-1.5 hover:bg-surface-muted"
          >
            <Heart
              className={cn("h-4 w-4", recipe.isFavorite ? "fill-danger text-danger" : "text-text-secondary")}
              aria-hidden="true"
            />
          </button>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {recipe.cookingTimeMinutes} min
        </span>
        <span className="flex items-center gap-1">
          <Flame className="h-3.5 w-3.5" aria-hidden="true" />
          {recipe.calories} kcal
        </span>
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden="true" />
          {recipe.averageRating.toFixed(1)} ({recipe.ratingCount})
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <DifficultyBadge difficulty={recipe.difficulty} />
        {recipe.dietTags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="neutral">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
