import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { DIET_TAGS, RECIPE_CATEGORIES } from '../types/recipe.type';

export class RecipeFiltersDto {
  @IsOptional()
  @IsIn(RECIPE_CATEGORIES as unknown as string[])
  category?: string;

  @IsOptional()
  @IsString()
  difficulty?: string;

  @IsOptional()
  @IsIn(DIET_TAGS as unknown as string[])
  dietTag?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  query?: string;
}
