import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeFiltersDto } from './dto/recipe.dto';
import { RecipeSummaryResponse } from './types/recipe.type';

/**
 * Recipe operations that are model-backed today — 4 of ACC1's 11.
 *
 * `getRecipeDetail` is absent because `RecipeDetail` needs `nutrition`,
 * `allergens` and `servings` (Nutrition-domain columns undefined) plus
 * `aiExplanation` (ACC3). Reviews, ratings, favourites, recently-viewed and
 * recommendations are absent for want of a model or a ranking contract.
 * See RECIPE-BLOCKED.
 */
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get('categories')
  getCategories(): string[] {
    return this.recipeService.getCategories();
  }

  @Get()
  search(@Query() filters: RecipeFiltersDto): Promise<RecipeSummaryResponse[]> {
    return this.recipeService.searchRecipes(filters);
  }

  @Get(':recipeId/similar')
  getSimilar(
    @Param('recipeId', ParseUUIDPipe) recipeId: string,
  ): Promise<RecipeSummaryResponse[]> {
    return this.recipeService.getSimilarRecipes(recipeId);
  }
}
