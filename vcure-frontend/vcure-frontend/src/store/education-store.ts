import { create } from "zustand";
import type { ArticleFilters, EducationCategory } from "@/types/education";

interface EducationStoreState {
  activeCategory: EducationCategory | null;
  filters: ArticleFilters;
  setActiveCategory: (category: EducationCategory | null) => void;
  setFilters: (filters: ArticleFilters) => void;
}

export const useEducationStore = create<EducationStoreState>()((set) => ({
  activeCategory: null,
  filters: {},
  setActiveCategory: (category) => set({ activeCategory: category }),
  setFilters: (filters) => set({ filters })
}));
