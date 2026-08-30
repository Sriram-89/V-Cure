/** ACC1 `MacroDistribution`. */
export interface MacroDistributionResponse {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** ACC1 `Micronutrient`. */
export interface MicronutrientResponse {
  name: string;
  amount: string;
  percentOfDailyValue: number;
}

/** ACC1 `NutritionBreakdown`. */
export interface NutritionBreakdownResponse {
  calories: number;
  macros: MacroDistributionResponse;
  micronutrients: MicronutrientResponse[];
}

/** ACC1 `PortionSize`. */
export interface PortionSizeResponse {
  amount: number;
  unit: string;
  description: string;
}

/** Bible API 34 (food search) list item. */
export interface FoodSummaryResponse {
  id: string;
  name: string;
  category: string | null;
  calories: number;
  dietTags: string[];
  allergenTags: string[];
}

/** Bible API 35 — GET /food/{id}. */
export interface FoodDetailResponse extends FoodSummaryResponse {
  nutrition: NutritionBreakdownResponse;
  portion: PortionSizeResponse;
}
