import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { NutritionBreakdown } from "@/types/nutrition";

export interface ShoppingCartItem {
  id: string;
  name: string;
  quantity: string;
  unitCount?: number;
  unit?: string;
  estimatedCost?: number;
  category?: string;
  sourceRecipeId?: string;
  // Optional per-unit nutrition snapshot from the shared Nutrition Model,
  // attached when the item came from a Product (Recipe-sourced ingredients
  // don't carry nutrition data and are simply excluded from cart totals).
  nutritionPerUnit?: NutritionBreakdown;
  isChecked: boolean;
}

interface ShoppingCartState {
  items: ShoppingCartItem[];
  addItems: (items: Omit<ShoppingCartItem, "isChecked">[]) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, unitCount: number) => void;
  clear: () => void;
}

export const useShoppingCartStore = create<ShoppingCartState>()(
  persist(
    (set) => ({
      items: [],
      addItems: (newItems) =>
        set((state) => {
          const existingNames = new Set(state.items.map((item) => item.name.toLowerCase()));
          const toAdd = newItems
            .filter((item) => !existingNames.has(item.name.toLowerCase()))
            .map((item) => ({ ...item, isChecked: false }));
          return { items: [...state.items, ...toAdd] };
        }),
      toggleItem: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, isChecked: !item.isChecked } : item
          )
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      updateQuantity: (id, unitCount) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, unitCount: Math.max(0, unitCount) } : item
          )
        })),
      clear: () => set({ items: [] })
    }),
    { name: "vcure-shopping-cart" }
  )
);
