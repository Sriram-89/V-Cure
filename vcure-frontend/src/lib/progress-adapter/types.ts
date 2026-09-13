import type {
  BmiEntry,
  CalorieEntry,
  DateRangePreset,
  GoalProgressDto,
  HealthScoreEntry,
  MealTrackingEntry,
  Milestone,
  NutritionProgressEntry,
  ProgressSummaryDto,
  WaterEntry,
  WeightEntry
} from "@/types/progress";

export interface ProgressAdapter {
  getSummary(): Promise<ProgressSummaryDto>;
  getWeightHistory(range: DateRangePreset): Promise<WeightEntry[]>;
  getBmiHistory(range: DateRangePreset): Promise<BmiEntry[]>;
  getCalorieHistory(range: DateRangePreset): Promise<CalorieEntry[]>;
  getWaterHistory(range: DateRangePreset): Promise<WaterEntry[]>;
  getMealTrackingHistory(range: DateRangePreset): Promise<MealTrackingEntry[]>;
  getNutritionProgress(range: DateRangePreset): Promise<NutritionProgressEntry[]>;
  getGoalProgress(): Promise<GoalProgressDto>;
  getHealthScoreHistory(range: DateRangePreset): Promise<HealthScoreEntry[]>;
  getMilestones(): Promise<Milestone[]>;
  logWeightEntry(weightKg: number): Promise<WeightEntry>;
}
