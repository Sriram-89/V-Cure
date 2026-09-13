"use client";

import { use, useEffect } from "react";
import { Heart, Clock, Flame, AlertCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { DifficultyBadge } from "@/components/recipes/difficulty-badge";
import { RatingStars } from "@/components/recipes/rating-stars";
import { IngredientsChecklist } from "@/components/recipes/ingredients-checklist";
import { CookingInstructions } from "@/components/recipes/cooking-instructions";
import { AllergensList, DietaryTags } from "@/components/recipes/allergens-dietary-tags";
import { MacroDistributionChart } from "@/components/meals/macro-distribution-chart";
import { MicronutrientsList } from "@/components/meals/micronutrients-list";
import { AiExplanationCard } from "@/components/meals/ai-explanation-card";
import { SimilarRecipes } from "@/components/recipes/similar-recipes";
import { ReviewsSection } from "@/components/recipes/reviews-section";
import { SharePrintActions } from "@/components/recipes/share-print-actions";
import { cn } from "@/lib/cn";
import {
  useRecipeDetail,
  useToggleFavoriteRecipe,
  useRecordRecipeView
} from "@/hooks/use-recipes";

export default function RecipeDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: recipe, isLoading, isError } = useRecipeDetail(id);
  const toggleFavorite = useToggleFavoriteRecipe();
  const recordView = useRecordRecipeView();

  useEffect(() => {
    recordView.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <Container className="max-w-3xl py-8">
        <div className="h-8 w-2/3 animate-pulse rounded bg-surface-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-card bg-surface-muted" />
      </Container>
    );
  }

  if (isError || !recipe) {
    return (
      <Container className="max-w-3xl py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />
          <p className="text-sm text-text-secondary">Couldn&apos;t load this recipe.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-8">
      <div className="print-area flex flex-col gap-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">{recipe.title}</h1>
            <div className="no-print flex items-center gap-2">
              <button
                type="button"
                aria-label={recipe.isFavorite ? "Remove from favorites" : "Save recipe"}
                aria-pressed={recipe.isFavorite}
                onClick={() => toggleFavorite.mutate(recipe.id)}
                className="rounded-full p-2 hover:bg-surface-muted"
              >
                <Heart
                  className={cn("h-5 w-5", recipe.isFavorite ? "fill-danger text-danger" : "text-text-secondary")}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {recipe.cookingTimeMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4" aria-hidden="true" />
              {recipe.calories} kcal
            </span>
            <DifficultyBadge difficulty={recipe.difficulty} />
            <RatingStars rating={recipe.averageRating} ratingCount={recipe.ratingCount} size="sm" />
          </div>

          <div className="mt-3">
            <DietaryTags tags={recipe.dietTags} />
          </div>

          <div className="no-print mt-4">
            <SharePrintActions title={recipe.title} />
          </div>
        </div>

        <AiExplanationCard explanation={recipe.aiExplanation} />

        <div>
          <h2 className="mb-2 text-sm font-semibold text-text-primary">Allergens</h2>
          <AllergensList allergens={recipe.allergens} />
        </div>

        <div className="rounded-card border border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Nutrition facts</h2>
            <span className="text-sm text-text-secondary">{recipe.servings.description}</span>
          </div>
          <MacroDistributionChart macros={recipe.nutrition.macros} />
          <MicronutrientsList micronutrients={recipe.nutrition.micronutrients} />
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-text-primary">Ingredients</h2>
          <IngredientsChecklist ingredients={recipe.ingredients} recipeId={recipe.id} />
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-text-primary">Instructions</h2>
          <CookingInstructions steps={recipe.instructions} />
        </div>

        <div className="no-print">
          <SimilarRecipes recipeId={recipe.id} />
        </div>

        <div className="no-print">
          <ReviewsSection recipeId={recipe.id} reviews={recipe.reviews} />
        </div>
      </div>
    </Container>
  );
}
