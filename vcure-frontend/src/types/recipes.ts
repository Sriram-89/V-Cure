import type {
  AllergenTag,
  DietTag,
  NutritionBreakdown,
  PortionSize
} from "@/types/nutrition";

export type RecipeDifficulty = "EASY" | "MEDIUM" | "HARD";
export type RecipeCategory =
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Snacks"
  | "Desserts"
  | "Beverages";

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: string;
}

export interface RecipeInstructionStep {
  step: number;
  instruction: string;
}

export interface RecipeReview {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface RecipeSummary {
  id: string;
  title: string;
  category: RecipeCategory;
  imageQuery: string;
  cookingTimeMinutes: number;
  difficulty: RecipeDifficulty;
  calories: number;
  dietTags: DietTag[];
  averageRating: number;
  ratingCount: number;
  isFavorite: boolean;
}

export interface RecipeDetail extends RecipeSummary {
  servings: PortionSize;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstructionStep[];
  nutrition: NutritionBreakdown;
  allergens: AllergenTag[];
  aiExplanation: string;
  similarRecipeIds: string[];
  reviews: RecipeReview[];
}

export interface RecipeFilters {
  category?: RecipeCategory;
  difficulty?: RecipeDifficulty;
  maxCookingTimeMinutes?: number;
  dietTag?: DietTag;
  query?: string;
}
