import { mealPlannerAdapter } from "@/lib/meal-adapter";
import type { MealFilters, MealSlot } from "@/types/meals";

export const mealService = {
  getDayPlan: (date: string) => mealPlannerAdapter.getDayPlan(date),
  getRecommended: (slot: MealSlot) => mealPlannerAdapter.getRecommendedMeals(slot),
  getAlternatives: (mealId: string) => mealPlannerAdapter.getAlternativeMeals(mealId),
  search: (filters: MealFilters) => mealPlannerAdapter.searchMeals(filters),
  getDetail: (mealId: string) => mealPlannerAdapter.getMealDetail(mealId),
  toggleFavorite: (mealId: string) => mealPlannerAdapter.toggleFavorite(mealId),
  getFavorites: () => mealPlannerAdapter.getFavoriteMeals(),
  getRecent: () => mealPlannerAdapter.getRecentMeals(),
  logConsumed: (mealId: string, date: string) => mealPlannerAdapter.logMealConsumed(mealId, date),
  logWater: (date: string, amountMl: number) => mealPlannerAdapter.logWaterIntake(date, amountMl)
};
