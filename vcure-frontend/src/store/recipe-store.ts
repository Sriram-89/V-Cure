import { create } from "zustand";
import type { RecipeCategory, RecipeFilters } from "@/types/recipes";

interface RecipeStoreState {
  activeCategory: RecipeCategory | null;
  filters: RecipeFilters;
  setActiveCategory: (category: RecipeCategory | null) => void;
  setFilters: (filters: RecipeFilters) => void;
}

export const useRecipeStore = create<RecipeStoreState>()((set) => ({
  activeCategory: null,
  filters: {},
  setActiveCategory: (category) => set({ activeCategory: category }),
  setFilters: (filters) => set({ filters })
}));
