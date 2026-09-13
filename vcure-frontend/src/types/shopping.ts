import type { NutritionBreakdown } from "@/types/nutrition";

export type GroceryCategory =
  | "Produce"
  | "Dairy"
  | "Grains"
  | "Protein"
  | "Snacks"
  | "Beverages"
  | "Pantry";

export type ProductAvailability = "IN_STOCK" | "LIMITED" | "OUT_OF_STOCK";

export interface StoreDto {
  id: string;
  name: string;
  distanceKm: number;
}

export interface ProductSummary {
  id: string;
  name: string;
  category: GroceryCategory;
  imageQuery: string;
  unit: string;
  pricePerUnit: number;
  availability: ProductAvailability;
  isFavorite: boolean;
  // Every product references the shared Nutrition Model — never redefined per module.
  nutrition: NutritionBreakdown;
}

export interface ProductDetail extends ProductSummary {
  brand: string;
  description: string;
  healthyAlternativeIds: string[];
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  category: GroceryCategory;
  sourceRecipeId?: string;
  isChecked: boolean;
}

export interface BudgetDto {
  monthlyLimitInr: number;
  spentThisMonthInr: number;
}

export interface ProductFilters {
  category?: GroceryCategory;
  availableOnly?: boolean;
  maxPrice?: number;
  query?: string;
}
