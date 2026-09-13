import type {
  DayPlan,
  MealDetail,
  MealFilters,
  MealSlot,
  MealSummary
} from "@/types/meals";

export interface MealPlannerAdapter {
  getDayPlan(date: string): Promise<DayPlan>;
  getRecommendedMeals(slot: MealSlot): Promise<MealSummary[]>;
  getAlternativeMeals(mealId: string): Promise<MealSummary[]>;
  searchMeals(filters: MealFilters): Promise<MealSummary[]>;
  getMealDetail(mealId: string): Promise<MealDetail>;
  toggleFavorite(mealId: string): Promise<{ isFavorite: boolean }>;
  getFavoriteMeals(): Promise<MealSummary[]>;
  getRecentMeals(): Promise<MealSummary[]>;
  logMealConsumed(mealId: string, date: string): Promise<void>;
  logWaterIntake(date: string, amountMl: number): Promise<{ waterLoggedMl: number }>;
}
