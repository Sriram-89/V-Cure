import type { MealPlannerAdapter } from "@/lib/meal-adapter/types";
import { mockMealPlannerAdapter } from "@/lib/meal-adapter/mock-adapter";

// TODO(backend): once /meal-planner/* endpoints exist in 05_API_CONTRACTS.md,
// implement a RealMealPlannerAdapter against apiClient and swap it in here.
// No component or hook in src/components/meals or src/hooks/use-meals.ts
// should need to change.
export const mealPlannerAdapter: MealPlannerAdapter = mockMealPlannerAdapter;

export type { MealPlannerAdapter } from "@/lib/meal-adapter/types";
