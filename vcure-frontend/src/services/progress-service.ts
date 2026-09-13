import { progressAdapter } from "@/lib/progress-adapter";
import type { DateRangePreset } from "@/types/progress";

export const progressService = {
  getSummary: () => progressAdapter.getSummary(),
  getWeightHistory: (range: DateRangePreset) => progressAdapter.getWeightHistory(range),
  getBmiHistory: (range: DateRangePreset) => progressAdapter.getBmiHistory(range),
  getCalorieHistory: (range: DateRangePreset) => progressAdapter.getCalorieHistory(range),
  getWaterHistory: (range: DateRangePreset) => progressAdapter.getWaterHistory(range),
  getMealTrackingHistory: (range: DateRangePreset) => progressAdapter.getMealTrackingHistory(range),
  getNutritionProgress: (range: DateRangePreset) => progressAdapter.getNutritionProgress(range),
  getGoalProgress: () => progressAdapter.getGoalProgress(),
  getHealthScoreHistory: (range: DateRangePreset) => progressAdapter.getHealthScoreHistory(range),
  getMilestones: () => progressAdapter.getMilestones(),
  logWeight: (weightKg: number) => progressAdapter.logWeightEntry(weightKg)
};
