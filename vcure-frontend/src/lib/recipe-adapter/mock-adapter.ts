import type { RecipeAdapter } from "@/lib/recipe-adapter/types";
import { MOCK_RECIPES, toRecipeSummary } from "@/lib/recipe-adapter/mock-data";
import type {
  RecipeCategory,
  RecipeDetail,
  RecipeFilters,
  RecipeSummary
} from "@/types/recipes";

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

let recipes: RecipeDetail[] = MOCK_RECIPES.map((recipe) => ({ ...recipe }));
const recentlyViewedIds: string[] = [];

function findRecipe(id: string): RecipeDetail {
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) throw new Error(`Recipe ${id} not found`);
  return recipe;
}

export const mockRecipeAdapter: RecipeAdapter = {
  async getRecommendedRecipes(): Promise<RecipeSummary[]> {
    return delay(recipes.map(toRecipeSummary));
  },

  async getCategories(): Promise<RecipeCategory[]> {
    return delay(["Breakfast", "Lunch", "Dinner", "Snacks", "Desserts", "Beverages"]);
  },

  async getRecipesByCategory(category: RecipeCategory): Promise<RecipeSummary[]> {
    return delay(recipes.filter((r) => r.category === category).map(toRecipeSummary));
  },

  async searchRecipes(filters: RecipeFilters): Promise<RecipeSummary[]> {
    let results = recipes;
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter((r) => r.title.toLowerCase().includes(query));
    }
    if (filters.category) {
      results = results.filter((r) => r.category === filters.category);
    }
    if (filters.difficulty) {
      results = results.filter((r) => r.difficulty === filters.difficulty);
    }
    if (filters.maxCookingTimeMinutes) {
      results = results.filter((r) => r.cookingTimeMinutes <= filters.maxCookingTimeMinutes!);
    }
    if (filters.dietTag) {
      results = results.filter((r) => r.dietTags.includes(filters.dietTag!));
    }
    return delay(results.map(toRecipeSummary));
  },

  async getRecipeDetail(recipeId: string): Promise<RecipeDetail> {
    return delay({ ...findRecipe(recipeId) });
  },

  async getSimilarRecipes(recipeId: string): Promise<RecipeSummary[]> {
    const recipe = findRecipe(recipeId);
    return delay(
      recipe.similarRecipeIds
        .map((id) => recipes.find((r) => r.id === id))
        .filter((r): r is RecipeDetail => Boolean(r))
        .map(toRecipeSummary)
    );
  },

  async toggleFavorite(recipeId: string): Promise<{ isFavorite: boolean }> {
    const recipe = findRecipe(recipeId);
    recipe.isFavorite = !recipe.isFavorite;
    return delay({ isFavorite: recipe.isFavorite });
  },

  async getFavoriteRecipes(): Promise<RecipeSummary[]> {
    return delay(recipes.filter((r) => r.isFavorite).map(toRecipeSummary));
  },

  async getRecentlyViewed(): Promise<RecipeSummary[]> {
    return delay(
      recentlyViewedIds
        .map((id) => recipes.find((r) => r.id === id))
        .filter((r): r is RecipeDetail => Boolean(r))
        .map(toRecipeSummary)
    );
  },

  async recordView(recipeId: string): Promise<void> {
    const existingIndex = recentlyViewedIds.indexOf(recipeId);
    if (existingIndex !== -1) recentlyViewedIds.splice(existingIndex, 1);
    recentlyViewedIds.unshift(recipeId);
    return delay(undefined);
  },

  async submitReview(
    recipeId: string,
    review: { rating: number; comment: string }
  ): Promise<{ averageRating: number; ratingCount: number }> {
    const recipe = findRecipe(recipeId);
    recipe.reviews.unshift({
      id: `r-${Date.now()}`,
      authorName: "You",
      rating: review.rating,
      comment: review.comment,
      createdAt: new Date().toISOString().slice(0, 10)
    });
    const total = recipe.averageRating * recipe.ratingCount + review.rating;
    recipe.ratingCount += 1;
    recipe.averageRating = Number((total / recipe.ratingCount).toFixed(1));
    return delay({ averageRating: recipe.averageRating, ratingCount: recipe.ratingCount });
  }
};
