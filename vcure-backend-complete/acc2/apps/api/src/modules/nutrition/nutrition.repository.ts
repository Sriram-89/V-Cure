import { Injectable } from '@nestjs/common';
import { Food, Prisma } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaTx } from '../../database/prisma-tx.type';

/** Canonical ACC3 Food graph needed to build ACC1's nutrition response. */
export type FoodWithNutrition = Food & {
  category: { name: string } | null;
  nutrition:
    | (
        & { caloriesKcal: number; proteinG: number; carbsG: number; fatG: number }
        & {
            micronutrients: {
              amount: number;
              micronutrient: { name: string; unit: string };
            }[];
          }
      )
    | null;
  servings: { servingName: string; gramsEquivalent: number }[];
};

const FOOD_GRAPH = {
  category: { select: { name: true } },
  nutrition: {
    include: {
      micronutrients: {
        include: { micronutrient: { select: { name: true, unit: true } } },
      },
    },
  },
  servings: { select: { servingName: true, gramsEquivalent: true } },
};

/**
 * Persistence for the canonical ACC3 Nutrition domain.
 * ACC2 owns no separate Food table — the ACC3 Safety Engine resolves
 * `proposedFoodIds` against these same rows.
 */
@Injectable()
export class NutritionRepository extends BaseRepository {
  findFoods(
    params: { keyword?: string; category?: string; dietType?: string },
    tx?: PrismaTx,
  ): Promise<FoodWithNutrition[]> {
    const where: Prisma.FoodWhereInput = {
      deletedAt: null,
      ...(params.category ? { category: { name: params.category } } : {}),
      // Only Vegetarian/Vegan are representable canonically — see NUTRITION note.
      ...(params.dietType === 'Vegan' ? { isVegan: true } : {}),
      ...(params.dietType === 'Vegetarian' ? { isVegetarian: true } : {}),
      ...(params.keyword
        ? { name: { contains: params.keyword, mode: 'insensitive' } }
        : {}),
    };
    return this.db(tx).food.findMany({
      where,
      include: FOOD_GRAPH,
      orderBy: { name: 'asc' },
    }) as Promise<FoodWithNutrition[]>;
  }

  findFoodById(id: string, tx?: PrismaTx): Promise<FoodWithNutrition | null> {
    return this.db(tx).food.findFirst({
      where: { id, deletedAt: null },
      include: FOOD_GRAPH,
    }) as Promise<FoodWithNutrition | null>;
  }

  /** Resolves `proposedFoodIds` before an ACC3 Safety Engine check. */
  findFoodsByIds(ids: string[], tx?: PrismaTx): Promise<Food[]> {
    return this.db(tx).food.findMany({
      where: { id: { in: ids }, deletedAt: null },
    });
  }
}
