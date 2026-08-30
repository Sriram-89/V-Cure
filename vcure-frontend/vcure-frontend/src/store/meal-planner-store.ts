import { create } from "zustand";
import type { MealFilters, MealSlot } from "@/types/meals";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface MealPlannerState {
  selectedDate: string;
  activeSlot: MealSlot;
  filters: MealFilters;
  selectedMealId: string | null;
  setSelectedDate: (date: string) => void;
  setActiveSlot: (slot: MealSlot) => void;
  setFilters: (filters: MealFilters) => void;
  openMeal: (mealId: string) => void;
  closeMeal: () => void;
}

export const useMealPlannerStore = create<MealPlannerState>()((set) => ({
  selectedDate: todayIso(),
  activeSlot: "BREAKFAST",
  filters: {},
  selectedMealId: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveSlot: (slot) => set({ activeSlot: slot }),
  setFilters: (filters) => set({ filters }),
  openMeal: (mealId) => set({ selectedMealId: mealId }),
  closeMeal: () => set({ selectedMealId: null })
}));
