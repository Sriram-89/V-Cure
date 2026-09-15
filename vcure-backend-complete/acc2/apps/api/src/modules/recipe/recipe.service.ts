import { Injectable, NotFoundException } from '@nestjs/common';
import { Recipe } from '@prisma/client';
import { RecipeRepository } from './recipe.repository';
import { RecipeFiltersDto } from './dto/recipe.dto';
import { RECIPE_CATEGORIES, RecipeSummaryResponse } from './types/recipe.type';

@Injectable()
export class RecipeService {
  constructor(private readonly repository: RecipeRepository) {}

  getCategories(): string[] {
    return [...RECIPE_CATEGORIES];
  }

  /** ACC1 `searchRecipes` and `getRecipesByCategory`. */
  async searchRecipes(filters: RecipeFiltersDto): Promise<RecipeSummaryResponse[]> {
    const recipes = await this.repository.findRecipes(filters);
    return recipes.map((r) => this.toSummary(r));
  }

  /** ACC1 `getSimilarRecipes`. Curated relation only — no similarity scoring. */
  async getSimilarRecipes(recipeId: string): Promise<RecipeSummaryResponse[]> {
    const recipe = await this.repository.findWithSimilar(recipeId);
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }
    return recipe.similarRecipes.map((r: Recipe & { category?: { name: string } | null }) =>
      this.toSummary(r),
    );
  }

  /**
   * `averageRating` / `ratingCount` are 0: no review system exists, so there
   * are genuinely zero ratings. `isFavorite` is false for the same reason —
   * no favourites model exists. Neither value is fabricated; both report the
   * true current state. See RECIPE-BLOCKED.
   */
  private toSummary(
    recipe: Recipe & { category?: { name: string } | null },
  ): RecipeSummaryResponse {
    const r = recipe as any;
    return {
      id: recipe.id,
      title: recipe.title,
      category: recipe.category?.name ?? '',
      imageQuery: r.imageQuery ?? recipe.title,
      // ACC1's single cooking time = ACC3's prep + cook. ACC3's split is
      // preserved canonically; only the aggregate is produced here.
      cookingTimeMinutes: recipe.prepTimeMinutes + recipe.cookTimeMinutes,
      difficulty: (recipe.difficulty ?? 'easy') as RecipeSummaryResponse['difficulty'],
      calories: r.calories ?? 0,
      dietTags: r.dietTags ?? [],
      averageRating: 0,
      ratingCount: 0,
      isFavorite: false,
    };
  }
}
