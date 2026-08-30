import { BmiCategory } from '../../health-profile/types/health-profile.type';

/** ACC1 `WeightTrendPointDto`. */
export interface WeightTrendPoint {
  date: string; // ISO
  weightKg: number;
}

/**
 * ACC1 `TodayMealDto`. Declared for contract fidelity only — the meal /
 * recommendation modules do not exist, so `todayMeals` is always [].
 */
export interface TodayMeal {
  id: string;
  slot: string;
  name: string;
  safetyStatus: string;
  safetyNote?: string;
}

/** ACC1 `DashboardSummaryDto`. */
export interface DashboardSummary {
  fullName: string;
  bmi: number | null;
  bmiCategory: BmiCategory | null;
  activeRiskFlags: string[];
  todayMeals: TodayMeal[];
  weightTrend: WeightTrendPoint[];
  streakDays: number;
}
