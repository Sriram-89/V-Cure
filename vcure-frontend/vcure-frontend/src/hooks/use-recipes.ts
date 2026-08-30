import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { recipeService } from "@/services/recipe-service";
import type { RecipeCategory, RecipeFilters } from "@/types/recipes";

export function useRecommendedRecipes() {
  return useQuery({ queryKey: ["recipes", "recommended"], queryFn: recipeService.getRecommended });
}

export function useRecipeCategories() {
  return useQuery({ queryKey: ["recipes", "categories"], queryFn: recipeService.getCategories });
}

export function useRecipesByCategory(category: RecipeCategory | null) {
  return useQuery({
    queryKey: ["recipes", "category", category],
    queryFn: () => recipeService.getByCategory(category as RecipeCategory),
    enabled: Boolean(category)
  });
}

export function useRecipeSearch(filters: RecipeFilters) {
  return useQuery({ queryKey: ["recipes", "search", filters], queryFn: () => recipeService.search(filters) });
}

export function useRecipeDetail(recipeId: string) {
  return useQuery({
    queryKey: ["recipes", "detail", recipeId],
    queryFn: () => recipeService.getDetail(recipeId)
  });
}

export function useSimilarRecipes(recipeId: string) {
  return useQuery({
    queryKey: ["recipes", "similar", recipeId],
    queryFn: () => recipeService.getSimilar(recipeId)
  });
}

export function useFavoriteRecipes() {
  return useQuery({ queryKey: ["recipes", "favorites"], queryFn: recipeService.getFavorites });
}

export function useRecentlyViewedRecipes() {
  return useQuery({ queryKey: ["recipes", "recent"], queryFn: recipeService.getRecentlyViewed });
}

export function useToggleFavoriteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) => recipeService.toggleFavorite(recipeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipes"] })
  });
}

export function useRecordRecipeView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) => recipeService.recordView(recipeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipes", "recent"] })
  });
}

export function useSubmitRecipeReview(recipeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (review: { rating: number; comment: string }) =>
      recipeService.submitReview(recipeId, review),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipes", "detail", recipeId] })
  });
}
