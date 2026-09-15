import { Injectable } from '@nestjs/common';
import { Prisma, Recipe } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaTx } from '../../database/prisma-tx.type';

export interface RecipeSearchParams {
  category?: string;
  difficulty?: string;
  dietTag?: string;
  query?: string;
}

@Injectable()
export class RecipeRepository extends BaseRepository {
  findRecipes(params: RecipeSearchParams, tx?: PrismaTx): Promise<Recipe[]> {
    const where: Prisma.RecipeWhereInput = {
      deletedAt: null,
      ...(params.category ? { category: { name: params.category } } : {}),
      ...(params.difficulty ? { difficulty: params.difficulty } : {}),
      ...(params.dietTag ? { dietTags: { has: params.dietTag } } : {}),
      ...(params.query
        ? { title: { contains: params.query, mode: 'insensitive' } }
        : {}),
    };
    return this.db(tx).recipe.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findWithSimilar(
    id: string,
    tx?: PrismaTx,
  ): Promise<(Recipe & { similarRecipes: Recipe[] }) | null> {
    const recipe = await this.db(tx).recipe.findFirst({
      where: { id, deletedAt: null },
      include: { category: { select: { name: true } } },
    });
    if (!recipe) return null;
    return { ...recipe, similarRecipes: [] } as any;
  }
}
