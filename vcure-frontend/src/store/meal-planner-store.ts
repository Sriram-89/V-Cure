import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MealFilters, MealSlot } from "@/types/meals";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_PRIMARY_MEALS: Record<MealSlot, string> = {
  BREAKFAST: "vegetable-oats-upma",
  LUNCH: "dal-tadka-roti",
  SNACK: "sprouts-salad",
  DINNER: "grilled-paneer-veggies"
};

interface MealPlannerState {
  selectedDate: string;
  activeSlot: MealSlot;
  filters: MealFilters;
  selectedMealId: string | null;
  selectedPrimaryMeals: Record<MealSlot, string>;
  setSelectedDate: (date: string) => void;
  setActiveSlot: (slot: MealSlot) => void;
  setFilters: (filters: MealFilters) => void;
  openMeal: (mealId: string) => void;
  closeMeal: () => void;
  replacePrimaryMeal: (slot: MealSlot, newMealId: string) => void;
  resetPrimaryMeals: () => void;
}

export const useMealPlannerStore = create<MealPlannerState>()(
  persist(
    (set) => ({
      selectedDate: todayIso(),
      activeSlot: "BREAKFAST",
      filters: {},
      selectedMealId: null,
      selectedPrimaryMeals: DEFAULT_PRIMARY_MEALS,
      setSelectedDate: (date) => set({ selectedDate: date }),
      setActiveSlot: (slot) => set({ activeSlot: slot }),
      setFilters: (filters) => set({ filters }),
      openMeal: (mealId) => set({ selectedMealId: mealId }),
      closeMeal: () => set({ selectedMealId: null }),
      replacePrimaryMeal: (slot, newMealId) =>
        set((state) => ({
          selectedPrimaryMeals: {
            ...state.selectedPrimaryMeals,
            [slot]: newMealId
          }
        })),
      resetPrimaryMeals: () => set({ selectedPrimaryMeals: DEFAULT_PRIMARY_MEALS })
    }),
    {
      name: "vcure-meal-planner",
      partialize: (state) => ({
        selectedPrimaryMeals: state.selectedPrimaryMeals
      })
    }
  )
);

