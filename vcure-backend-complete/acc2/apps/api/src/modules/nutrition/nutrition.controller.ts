import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { FoodSearchDto } from './dto/food-search.dto';
import { FoodDetailResponse, FoodSummaryResponse } from './types/nutrition.type';

/** Bible APIs 34 and 35. Literal route registered before `:foodId`. */
@Controller('food')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('search')
  search(@Query() dto: FoodSearchDto): Promise<FoodSummaryResponse[]> {
    return this.nutritionService.searchFoods(dto);
  }

  @Get(':foodId')
  getDetail(
    @Param('foodId', ParseUUIDPipe) foodId: string,
  ): Promise<FoodDetailResponse> {
    return this.nutritionService.getFoodDetail(foodId);
  }
}
