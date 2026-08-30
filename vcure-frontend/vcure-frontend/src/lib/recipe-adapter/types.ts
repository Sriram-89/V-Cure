import type { RecipeCategory, RecipeDetail, RecipeFilters, RecipeSummary } from "@/types/recipes";

export interface RecipeAdapter {
  getRecommendedRecipes(): Promise<RecipeSummary[]>;
  getCategories(): Promise<RecipeCategory[]>;
  getRecipesByCategory(category: RecipeCategory): Promise<RecipeSummary[]>;
  searchRecipes(filters: RecipeFilters): Promise<RecipeSummary[]>;
  getRecipeDetail(recipeId: string): Promise<RecipeDetail>;
  getSimilarRecipes(recipeId: string): Promise<RecipeSummary[]>;
  toggleFavorite(recipeId: string): Promise<{ isFavorite: boolean }>;
  getFavoriteRecipes(): Promise<RecipeSummary[]>;
  getRecentlyViewed(): Promise<RecipeSummary[]>;
  recordView(recipeId: string): Promise<void>;
  submitReview(
    recipeId: string,
    review: { rating: number; comment: string }
  ): Promise<{ averageRating: number; ratingCount: number }>;
}
