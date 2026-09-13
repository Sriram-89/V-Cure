import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DateRangePreset } from "@/types/progress";

export interface WeightLogEntry {
  date: string;
  weightKg: number;
}

interface ProgressStoreState {
  range: DateRangePreset;
  setRange: (range: DateRangePreset) => void;
  eatenMealIds: string[];
  weightLogs: WeightLogEntry[];
  streakDays: number;
  logMeal: (mealId: string) => void;
  unlogMeal: (mealId: string) => void;
  toggleMealEaten: (mealId: string) => boolean;
  logWeight: (weightKg: number) => void;
}

export const useProgressStore = create<ProgressStoreState>()(
  persist(
    (set, get) => ({
      range: "30D",
      setRange: (range) => set({ range }),
      eatenMealIds: [],
      weightLogs: [],
      streakDays: 0,

      logMeal: (mealId) =>
        set((state) => ({
          eatenMealIds: Array.from(new Set([...state.eatenMealIds, mealId])),
          streakDays: Math.max(state.streakDays, 1)
        })),

      unlogMeal: (mealId) =>
        set((state) => ({
          eatenMealIds: state.eatenMealIds.filter((id) => id !== mealId)
        })),

      toggleMealEaten: (mealId) => {
        const state = get();
        const isEaten = state.eatenMealIds.includes(mealId);
        if (isEaten) {
          state.unlogMeal(mealId);
          return false;
        } else {
          state.logMeal(mealId);
          return true;
        }
      },

      logWeight: (weightKg) =>
        set((state) => ({
          weightLogs: [
            ...state.weightLogs,
            { date: new Date().toISOString().split("T")[0] as string, weightKg }
          ]
        }))
    }),
    {
      name: "vcure-progress-tracker"
    }
  )
);
