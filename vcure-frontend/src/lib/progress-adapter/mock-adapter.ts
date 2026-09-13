import type { ProgressAdapter } from "@/lib/progress-adapter/types";
import {
  generateWeightHistory,
  generateBmiHistory,
  generateCalorieHistory,
  generateWaterHistory,
  generateMealTrackingHistory,
  generateNutritionProgress,
  generateHealthScoreHistory,
  MOCK_MILESTONES
} from "@/lib/progress-adapter/mock-data";
import { rangeToDays } from "@/lib/progress-calculations";
import type { DateRangePreset, GoalProgressDto, ProgressSummaryDto, WeightEntry } from "@/types/progress";

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

// Generate a full year once; slice per requested range so history stays
// internally consistent across widgets.
const fullWeightHistory = generateWeightHistory(365);
const fullBmiHistory = generateBmiHistory(fullWeightHistory);
const fullCalorieHistory = generateCalorieHistory(365);
const fullWaterHistory = generateWaterHistory(365);
const fullMealTrackingHistory = generateMealTrackingHistory(90);
const fullNutritionProgress = generateNutritionProgress(365);
const fullHealthScoreHistory = generateHealthScoreHistory(365);
let weightLog: WeightEntry[] = [...fullWeightHistory];

function takeLast<T>(entries: T[], days: number): T[] {
  return entries.slice(Math.max(0, entries.length - days));
}

export const mockProgressAdapter: ProgressAdapter = {
  async getSummary(): Promise<ProgressSummaryDto> {
    const latestWeight = weightLog[weightLog.length - 1] ?? { weightKg: 72 };
    const latestBmi = fullBmiHistory[fullBmiHistory.length - 1] ?? { bmi: 23.5 };
    const latestScore = fullHealthScoreHistory[fullHealthScoreHistory.length - 1] ?? { score: 85 };
    const lastWeekCalories = takeLast(fullCalorieHistory, 7);
    const adherence =
      (lastWeekCalories.filter((e) => e.consumedCalories <= e.targetCalories * 1.1).length /
        lastWeekCalories.length) *
      100;

    return delay({
      currentWeightKg: latestWeight.weightKg,
      currentBmi: latestBmi.bmi,
      currentBloodGroup: "O_POSITIVE",
      streakDays: 12,
      healthScore: latestScore.score,
      weeklyCalorieAdherencePercent: Math.round(adherence)
    });
  },

  async getWeightHistory(range: DateRangePreset) {
    return delay(takeLast(weightLog, rangeToDays(range)));
  },

  async getBmiHistory(range: DateRangePreset) {
    return delay(takeLast(fullBmiHistory, rangeToDays(range)));
  },

  async getCalorieHistory(range: DateRangePreset) {
    return delay(takeLast(fullCalorieHistory, rangeToDays(range)));
  },

  async getWaterHistory(range: DateRangePreset) {
    return delay(takeLast(fullWaterHistory, rangeToDays(range)));
  },

  async getMealTrackingHistory(range: DateRangePreset) {
    const days = Math.min(rangeToDays(range), 90);
    return delay(fullMealTrackingHistory.filter((entry) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return new Date(entry.date) >= cutoff;
    }));
  },

  async getNutritionProgress(range: DateRangePreset) {
    return delay(takeLast(fullNutritionProgress, rangeToDays(range)));
  },

  async getGoalProgress(): Promise<GoalProgressDto> {
    const latestWeight = weightLog[weightLog.length - 1] ?? { weightKg: 72 };
    return delay({
      goalLabel: "Reach target weight",
      startValue: 78,
      currentValue: latestWeight.weightKg,
      targetValue: 70,
      unit: "kg"
    });
  },

  async getHealthScoreHistory(range: DateRangePreset) {
    return delay(takeLast(fullHealthScoreHistory, rangeToDays(range)));
  },

  async getMilestones() {
    return delay(MOCK_MILESTONES);
  },

  async logWeightEntry(weightKg: number) {
    const entry = { date: new Date().toISOString().slice(0, 10), weightKg };
    weightLog = [...weightLog, entry];
    return delay(entry);
  }
};
