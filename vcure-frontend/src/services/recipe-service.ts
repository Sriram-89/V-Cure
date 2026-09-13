import { recipeAdapter } from "@/lib/recipe-adapter";
import type { RecipeCategory, RecipeFilters } from "@/types/recipes";

export const recipeService = {
  getRecommended: () => recipeAdapter.getRecommendedRecipes(),
  getCategories: () => recipeAdapter.getCategories(),
  getByCategory: (category: RecipeCategory) => recipeAdapter.getRecipesByCategory(category),
  search: (filters: RecipeFilters) => recipeAdapter.searchRecipes(filters),
  getDetail: (recipeId: string) => recipeAdapter.getRecipeDetail(recipeId),
  getSimilar: (recipeId: string) => recipeAdapter.getSimilarRecipes(recipeId),
  toggleFavorite: (recipeId: string) => recipeAdapter.toggleFavorite(recipeId),
  getFavorites: () => recipeAdapter.getFavoriteRecipes(),
  getRecentlyViewed: () => recipeAdapter.getRecentlyViewed(),
  recordView: (recipeId: string) => recipeAdapter.recordView(recipeId),
  submitReview: (recipeId: string, review: { rating: number; comment: string }) =>
    recipeAdapter.submitReview(recipeId, review)
};
