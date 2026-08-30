import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { DIET_TAGS } from '../../recipe/types/recipe.type';

/**
 * Bible API 34 — GET /food/search.
 * Documented params: Keyword, Category, Region, Diet Type.
 * `Region` is not accepted: no RegionalFood columns are defined, so a region
 * filter has nothing to filter on. Nothing beyond the documented set is added.
 */
export class FoodSearchDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  keyword?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsIn(DIET_TAGS as unknown as string[])
  dietType?: string;
}
