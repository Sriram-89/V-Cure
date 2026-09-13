import type { MealPlannerAdapter } from "@/lib/meal-adapter/types";
import { MOCK_MEALS, toSummary } from "@/lib/meal-adapter/mock-data";
import type {
  DayPlan,
  MealDetail,
  MealFilters,
  MealSlot,
  MealSummary
} from "@/types/meals";

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

// Mutable in-memory store so favorite/log actions persist for the session.
let meals: MealDetail[] = MOCK_MEALS.map((meal) => ({ ...meal }));
const recentMealIds: string[] = ["meal-oats-berries", "meal-grilled-paneer-bowl"];
const loggedWaterByDate = new Map<string, number>();

function findMeal(id: string): MealDetail {
  const meal = meals.find((m) => m.id === id);
  if (!meal) throw new Error(`Meal ${id} not found`);
  return meal;
}

export const mockMealPlannerAdapter: MealPlannerAdapter = {
  async getDayPlan(date: string): Promise<DayPlan> {
    const bySlot = (slot: MealSlot): MealSummary[] =>
      meals.filter((meal) => meal.slot === slot).slice(0, 1).map(toSummary);

    const plan: DayPlan = {
      date,
      meals: {
        BREAKFAST: bySlot("BREAKFAST"),
        LUNCH: bySlot("LUNCH"),
        DINNER: bySlot("DINNER"),
        SNACK: bySlot("SNACK")
      },
      waterTargetMl: 2500,
      waterLoggedMl: loggedWaterByDate.get(date) ?? 500
    };
    return delay(plan);
  },

  async getRecommendedMeals(slot: MealSlot): Promise<MealSummary[]> {
    return delay(meals.filter((meal) => meal.slot === slot).map(toSummary));
  },

  async getAlternativeMeals(mealId: string): Promise<MealSummary[]> {
    const meal = findMeal(mealId);
    return delay(
      meal.alternativeMealIds
        .map((id) => meals.find((m) => m.id === id))
        .filter((m): m is MealDetail => Boolean(m))
        .map(toSummary)
    );
  },

  async searchMeals(filters: MealFilters): Promise<MealSummary[]> {
    let results = meals;
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter((meal) => meal.name.toLowerCase().includes(query));
    }
    if (filters.dietType) {
      results = results.filter((meal) => meal.dietTags.includes(filters.dietType!));
    }
    if (filters.maxCalories) {
      results = results.filter((meal) => meal.calories <= filters.maxCalories!);
    }
    if (filters.allergySafeOnly) {
      results = results.filter((meal) => meal.safetyStatus === "SAFE");
    }
    return delay(results.map(toSummary));
  },

  async getMealDetail(mealId: string): Promise<MealDetail> {
    return delay({ ...findMeal(mealId) });
  },

  async toggleFavorite(mealId: string): Promise<{ isFavorite: boolean }> {
    const meal = findMeal(mealId);
    meal.isFavorite = !meal.isFavorite;
    return delay({ isFavorite: meal.isFavorite });
  },

  async getFavoriteMeals(): Promise<MealSummary[]> {
    return delay(meals.filter((meal) => meal.isFavorite).map(toSummary));
  },

  async getRecentMeals(): Promise<MealSummary[]> {
    return delay(
      recentMealIds
        .map((id) => meals.find((m) => m.id === id))
        .filter((m): m is MealDetail => Boolean(m))
        .map(toSummary)
    );
  },

  async logMealConsumed(mealId: string, _date: string): Promise<void> {
    recentMealIds.unshift(mealId);
    return delay(undefined);
  },

  async logWaterIntake(date: string, amountMl: number): Promise<{ waterLoggedMl: number }> {
    const current = loggedWaterByDate.get(date) ?? 0;
    const next = current + amountMl;
    loggedWaterByDate.set(date, next);
    return delay({ waterLoggedMl: next });
  }
};
