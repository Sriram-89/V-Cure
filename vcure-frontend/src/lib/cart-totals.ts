import type { ShoppingCartItem } from "@/store/shopping-cart-store";

export interface CartTotals {
  totalCost: number;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  itemsWithNutritionCount: number;
}

export function computeCartTotals(items: ShoppingCartItem[]): CartTotals {
  return items.reduce<CartTotals>(
    (totals, item) => {
      const cost = item.estimatedCost ?? 0;
      const units = item.unitCount ?? 1;
      const nutrition = item.nutritionPerUnit;

      return {
        totalCost: totals.totalCost + cost,
        totalCalories: totals.totalCalories + (nutrition ? nutrition.calories * units : 0),
        totalProteinG: totals.totalProteinG + (nutrition ? nutrition.macros.proteinG * units : 0),
        totalCarbsG: totals.totalCarbsG + (nutrition ? nutrition.macros.carbsG * units : 0),
        totalFatG: totals.totalFatG + (nutrition ? nutrition.macros.fatG * units : 0),
        itemsWithNutritionCount: totals.itemsWithNutritionCount + (nutrition ? 1 : 0)
      };
    },
    {
      totalCost: 0,
      totalCalories: 0,
      totalProteinG: 0,
      totalCarbsG: 0,
      totalFatG: 0,
      itemsWithNutritionCount: 0
    }
  );
}
