import { Injectable, NotFoundException } from '@nestjs/common';

import { NutritionRepository, FoodWithNutrition } from './nutrition.repository';
import { FoodSearchDto } from './dto/food-search.dto';
import { FoodDetailResponse, FoodSummaryResponse } from './types/nutrition.type';

@Injectable()
export class NutritionService {
  constructor(private readonly repository: NutritionRepository) {}

  /** Bible API 34 — GET /food/search. */
  async searchFoods(dto: FoodSearchDto): Promise<FoodSummaryResponse[]> {
    const foods = await this.repository.findFoods(dto);
    return foods.map((f) => this.toSummary(f));
  }

  /**
   * Bible API 35 — GET /food/{id}.
   *
   * Reads the canonical ACC3 graph (Food -> FoodNutrition -> FoodMicronutrient
   * -> Micronutrient, plus FoodServing) and reshapes it into ACC1's
   * NutritionBreakdown/PortionSize at the API boundary. The ACC1 contract is
   * unchanged. RULE-007 still holds: every value is stored data, nothing is
   * computed.
   */
  async getFoodDetail(id: string): Promise<FoodDetailResponse> {
    const food = await this.repository.findFoodById(id);
    if (!food) {
      throw new NotFoundException('Food not found');
    }
    const serving = food.servings[0];
    return {
      ...this.toSummary(food),
      nutrition: {
        calories: food.nutrition?.caloriesKcal ?? 0,
        macros: {
          proteinG: food.nutrition?.proteinG ?? 0,
          carbsG: food.nutrition?.carbsG ?? 0,
          fatG: food.nutrition?.fatG ?? 0,
        },
        micronutrients: (food.nutrition?.micronutrients ?? []).map(
          (m: { amount: number; micronutrient: { name: string; unit: string } }) => ({
          name: m.micronutrient.name,
          // ACC1 expects a display string; ACC3 stores amount + unit separately.
          amount: `${m.amount} ${m.micronutrient.unit}`,
          percentOfDailyValue: 0,
          }),
        ),
      },
      portion: {
        amount: serving?.gramsEquivalent ?? 0,
        unit: 'g',
        description: serving?.servingName ?? '',
      },
    };
  }

  /**
   * ACC1 `dietTags` is a nine-value union; ACC3 canonically represents only
   * Vegetarian and Vegan (booleans on Food). The remaining seven tags have no
   * canonical column, so only what is actually stored is returned — nothing is
   * inferred. `allergenTags` is empty for the same reason: ACC3 models
   * allergens via FoodRestriction -> AllergyType, which is not yet migrated.
   */
  private toSummary(food: FoodWithNutrition): FoodSummaryResponse {
    const dietTags: string[] = [];
    if (food.isVegetarian) dietTags.push('Vegetarian');
    if (food.isVegan) dietTags.push('Vegan');
    return {
      id: food.id,
      name: food.name,
      category: food.category?.name ?? null,
      calories: food.nutrition?.caloriesKcal ?? 0,
      dietTags,
      allergenTags: [],
    };
  }
}
