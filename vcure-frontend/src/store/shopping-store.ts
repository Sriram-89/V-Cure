import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GroceryCategory, ProductFilters } from "@/types/shopping";

interface ShoppingStoreState {
  activeCategory: GroceryCategory | null;
  filters: ProductFilters;
  selectedStoreId: string | null;
  setActiveCategory: (category: GroceryCategory | null) => void;
  setFilters: (filters: ProductFilters) => void;
  setSelectedStoreId: (storeId: string) => void;
}

export const useShoppingStore = create<ShoppingStoreState>()(
  persist(
    (set) => ({
      activeCategory: null,
      filters: {},
      selectedStoreId: null,
      setActiveCategory: (category) => set({ activeCategory: category }),
      setFilters: (filters) => set({ filters }),
      setSelectedStoreId: (storeId) => set({ selectedStoreId: storeId })
    }),
    { name: "vcure-shopping-prefs", partialize: (state) => ({ selectedStoreId: state.selectedStoreId }) }
  )
);
