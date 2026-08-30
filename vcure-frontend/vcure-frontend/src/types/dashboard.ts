// Dashboard DTOs — locked to 05_API_CONTRACTS.md dashboard aggregate endpoint.
import type { MealSafetyStatus, MealSlot } from "@/types/meals";

export type { MealSafetyStatus } from "@/types/meals";

export interface TodayMealDto {
  id: string;
  slot: MealSlot;
  name: string;
  safetyStatus: MealSafetyStatus;
  safetyNote?: string;
}

export interface WeightTrendPointDto {
  date: string; // ISO date
  weightKg: number;
}

export interface DashboardSummaryDto {
  fullName: string;
  bmi: number | null;
  bmiCategory: "UNDERWEIGHT" | "NORMAL" | "OVERWEIGHT" | "OBESE" | null;
  activeRiskFlags: string[];
  todayMeals: TodayMealDto[];
  weightTrend: WeightTrendPointDto[];
  streakDays: number;
}
