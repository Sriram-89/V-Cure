import type {
  BmiEntry,
  CalorieEntry,
  MealTrackingEntry,
  HealthScoreEntry,
  Milestone,
  NutritionProgressEntry,
  WaterEntry,
  WeightEntry
} from "@/types/progress";
import type { MealSlot } from "@/types/meals";

function isoDaysAgo(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function bmiCategory(bmi: number): BmiEntry["category"] {
  if (bmi < 18.5) return "UNDERWEIGHT";
  if (bmi < 25) return "NORMAL";
  if (bmi < 30) return "OVERWEIGHT";
  return "OBESE";
}

const HEIGHT_M = 1.7;
const STARTING_WEIGHT = 78;

export function generateWeightHistory(days: number): WeightEntry[] {
  return Array.from({ length: days }, (_, i) => {
    const daysAgo = days - 1 - i;
    // Gentle downward trend with small noise.
    const trend = STARTING_WEIGHT - (days - daysAgo) * 0.03;
    const noise = Math.sin(daysAgo) * 0.3;
    return { date: isoDaysAgo(daysAgo), weightKg: Number((trend + noise).toFixed(1)) };
  });
}

export function generateBmiHistory(weightHistory: WeightEntry[]): BmiEntry[] {
  return weightHistory.map((entry) => {
    const bmi = Number((entry.weightKg / (HEIGHT_M * HEIGHT_M)).toFixed(1));
    return { date: entry.date, bmi, category: bmiCategory(bmi) };
  });
}

export function generateCalorieHistory(days: number): CalorieEntry[] {
  const target = 2000;
  return Array.from({ length: days }, (_, i) => {
    const daysAgo = days - 1 - i;
    const consumed = Math.round(target - 150 + Math.sin(daysAgo * 1.3) * 250);
    return { date: isoDaysAgo(daysAgo), consumedCalories: Math.max(800, consumed), targetCalories: target };
  });
}

export function generateWaterHistory(days: number): WaterEntry[] {
  const target = 2500;
  return Array.from({ length: days }, (_, i) => {
    const daysAgo = days - 1 - i;
    const logged = Math.round(target - 400 + Math.cos(daysAgo) * 500);
    return { date: isoDaysAgo(daysAgo), loggedMl: Math.max(0, logged), targetMl: target };
  });
}

export function generateMealTrackingHistory(days: number): MealTrackingEntry[] {
  const slots: MealSlot[] = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];
  const entries: MealTrackingEntry[] = [];
  for (let i = 0; i < days; i++) {
    const daysAgo = days - 1 - i;
    const date = isoDaysAgo(daysAgo);
    slots.forEach((slot, slotIndex) => {
      const wasLogged = (daysAgo + slotIndex) % 5 !== 0;
      entries.push({ date, slot, wasLogged });
    });
  }
  return entries;
}

export function generateNutritionProgress(days: number): NutritionProgressEntry[] {
  return Array.from({ length: days }, (_, i) => {
    const daysAgo = days - 1 - i;
    return {
      date: isoDaysAgo(daysAgo),
      macros: {
        proteinG: Math.round(70 + Math.sin(daysAgo) * 15),
        carbsG: Math.round(220 + Math.cos(daysAgo) * 30),
        fatG: Math.round(60 + Math.sin(daysAgo * 0.7) * 10)
      }
    };
  });
}

export function generateHealthScoreHistory(days: number): HealthScoreEntry[] {
  return Array.from({ length: days }, (_, i) => {
    const daysAgo = days - 1 - i;
    const score = Math.round(62 + (days - daysAgo) * 0.08 + Math.sin(daysAgo) * 3);
    return { date: isoDaysAgo(daysAgo), score: Math.max(0, Math.min(100, score)) };
  });
}

export const MOCK_MILESTONES: Milestone[] = [
  {
    id: "milestone-first-log",
    title: "First meal logged",
    description: "You logged your first meal.",
    achievedDate: isoDaysAgo(58),
    isAchieved: true
  },
  {
    id: "milestone-7-day-streak",
    title: "7-day streak",
    description: "Logged a meal every day for a week.",
    achievedDate: isoDaysAgo(45),
    isAchieved: true
  },
  {
    id: "milestone-2kg-lost",
    title: "2kg milestone",
    description: "Lost 2kg since you started.",
    achievedDate: isoDaysAgo(20),
    isAchieved: true
  },
  {
    id: "milestone-30-day-streak",
    title: "30-day streak",
    description: "Log a meal every day for 30 days straight.",
    achievedDate: null,
    isAchieved: false
  },
  {
    id: "milestone-goal-weight",
    title: "Reach your goal weight",
    description: "Hit the target weight from your health goals.",
    achievedDate: null,
    isAchieved: false
  }
];
