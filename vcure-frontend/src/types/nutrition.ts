// Shared Nutrition Model.
// Every feature that displays or computes nutrition (Meal Planner, Recipe
// Module, Shopping, AI Chat, Nutrition Dashboard) imports these types
// instead of declaring its own. This is the single source of truth.

export interface MacroDistribution {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Micronutrient {
  name: string;
  amount: string;
  percentOfDailyValue: number;
}

export interface NutritionBreakdown {
  calories: number;
  macros: MacroDistribution;
  micronutrients: Micronutrient[];
}

export interface PortionSize {
  amount: number;
  unit: string;
  description: string;
}

export type DietTag =
  | "Vegetarian"
  | "Vegan"
  | "Pescatarian"
  | "High Protein"
  | "High Fiber"
  | "Low Carb"
  | "Keto"
  | "Gluten Free"
  | "Dairy Free";

export type AllergenTag =
  | "Peanuts"
  | "Tree Nuts"
  | "Dairy"
  | "Eggs"
  | "Gluten"
  | "Soy"
  | "Shellfish";
