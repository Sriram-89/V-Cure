export type RecipeDifficulty = 'easy' | 'medium' | 'hard' | string;

/** ACC1 `RecipeCategory` — closed union, sourced from the consumer contract. */
export const RECIPE_CATEGORIES = [
  'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 'Beverages',
] as const;

/** ACC1 `DietTag`. */
export const DIET_TAGS = [
  'Vegetarian', 'Vegan', 'Pescatarian', 'High Protein', 'High Fiber',
  'Low Carb', 'Keto', 'Gluten Free', 'Dairy Free',
] as const;

/** ACC1 `RecipeSummary`. */
export interface RecipeSummaryResponse {
  id: string;
  title: string;
  category: string;
  imageQuery: string;
  cookingTimeMinutes: number;
  difficulty: RecipeDifficulty;
  calories: number;
  dietTags: string[];
  averageRating: number;
  ratingCount: number;
  isFavorite: boolean;
}
