import type { MacroDistribution } from "@/types/nutrition";
import type { MealSlot } from "@/types/meals";
import type { BloodGroup } from "@/types/onboarding";

export type DateRangePreset = "7D" | "30D" | "90D" | "1Y";

export interface WeightEntry {
  date: string; // ISO date
  weightKg: number;
}

export interface BmiEntry {
  date: string;
  bmi: number;
  category: "UNDERWEIGHT" | "NORMAL" | "OVERWEIGHT" | "OBESE";
}

export interface CalorieEntry {
  date: string;
  consumedCalories: number;
  targetCalories: number;
}

export interface WaterEntry {
  date: string;
  loggedMl: number;
  targetMl: number;
}

export interface MealTrackingEntry {
  date: string;
  slot: MealSlot;
  wasLogged: boolean;
}

export interface NutritionProgressEntry {
  date: string;
  macros: MacroDistribution;
}

export interface GoalProgressDto {
  goalLabel: string;
  targetValue: number;
  currentValue: number;
  startValue: number;
  unit: string;
}

export interface HealthScoreEntry {
  date: string;
  score: number; // 0-100
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedDate: string | null;
  isAchieved: boolean;
}

export interface ProgressSummaryDto {
  currentWeightKg: number;
  currentBmi: number;
  currentBloodGroup: BloodGroup;
  streakDays: number;
  healthScore: number;
  weeklyCalorieAdherencePercent: number;
}
