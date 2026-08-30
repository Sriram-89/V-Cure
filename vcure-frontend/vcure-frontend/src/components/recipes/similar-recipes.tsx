import { RecipeCard } from "@/components/recipes/recipe-card";
import { RecipeGridSkeleton } from "@/components/recipes/recipe-skeleton";
import { useSimilarRecipes, useToggleFavoriteRecipe } from "@/hooks/use-recipes";

export function SimilarRecipes({ recipeId }: { recipeId: string }) {
  const { data, isLoading, isError } = useSimilarRecipes(recipeId);
  const toggleFavorite = useToggleFavoriteRecipe();

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-text-primary">Similar recipes</h2>
      {isLoading ? (
        <RecipeGridSkeleton count={2} />
      ) : isError || !data ? (
        <p className="text-sm text-danger">Couldn&apos;t load similar recipes.</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-text-secondary">No similar recipes found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onToggleFavorite={(id) => toggleFavorite.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
