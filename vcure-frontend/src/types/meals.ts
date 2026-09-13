import type { NutritionBreakdown, PortionSize } from "@/types/nutrition";

export type MealSlot = "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
export type MealSafetyStatus = "SAFE" | "FLAGGED" | "BLOCKED";

export type { MacroDistribution, Micronutrient, NutritionBreakdown, PortionSize } from "@/types/nutrition";

export interface MealSummary {
  id: string;
  name: string;
  slot: MealSlot;
  imageQuery: string;
  calories: number;
  safetyStatus: MealSafetyStatus;
  safetyNote: string | null;
  isFavorite: boolean;
  dietTags: string[];
}

export interface MealDetail extends MealSummary {
  nutrition: NutritionBreakdown;
  portion: PortionSize;
  aiExplanation: string;
  ingredients: string[];
  alternativeMealIds: string[];
}

export interface DayPlan {
  date: string; // ISO date
  meals: Record<MealSlot, MealSummary[]>;
  waterTargetMl: number;
  waterLoggedMl: number;
}

export interface MealFilters {
  dietType?: string;
  maxCalories?: number;
  allergySafeOnly?: boolean;
  query?: string;
}

export interface MealLogEntryDto {
  mealId: string;
  date: string;
  consumedAt: string;
}
