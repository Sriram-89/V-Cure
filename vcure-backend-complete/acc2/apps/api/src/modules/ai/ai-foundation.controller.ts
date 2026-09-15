import { Controller, Post, Get, Body, UseGuards, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SafetyEngineService,
  RecommendationEngineFoundationService,
  ExplainabilityEngineService,
} from 'vcure-backend';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AuthenticatedUser } from '../auth/types/auth-tokens.type';
import { MealType } from '@prisma/client';
import { AppConfig } from '../../config/configuration';

export const DEMO_USER_ID = '11111111-1111-1111-1111-111111111111';
export const DEMO_FOOD_PEANUT_BUTTER_ID = '22222222-2222-2222-2222-222222222222';
export const DEMO_FOOD_OATMEAL_ID = '33333333-3333-3333-3333-333333333333';
export const DEMO_FOOD_CHICKEN_SALAD_ID = '55555555-5555-5555-5555-555555555555';
export const DEMO_MEAL_ID = '77777777-7777-7777-7777-777777777777';

@Controller('ai')
export class AiFoundationController {
  constructor(
    private readonly safetyEngine: SafetyEngineService,
    private readonly recommendationEngine: RecommendationEngineFoundationService,
    private readonly explainabilityEngine: ExplainabilityEngineService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  @Public()
  @Post('safety-check')
  async checkSafety(
    @Body() dto: { userId?: string; proposedFoodIds?: string[] },
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const targetUserId = user?.id || dto.userId || DEMO_USER_ID;
    const foodIds = dto.proposedFoodIds && dto.proposedFoodIds.length > 0
      ? dto.proposedFoodIds
      : [DEMO_FOOD_PEANUT_BUTTER_ID];

    return this.safetyEngine.check({
      userId: targetUserId,
      proposedFoodIds: foodIds,
    });
  }

  @Public()
  @Post('recommendation')
  async getRecommendation(
    @Body()
    dto: {
      userId?: string;
      mealId?: string;
      mealType?: MealType;
      candidateFoodIds?: string[];
    },
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    const targetUserId = user?.id || dto.userId || DEMO_USER_ID;
    const mealId = dto.mealId || DEMO_MEAL_ID;
    const mealType = dto.mealType || MealType.BREAKFAST;
    const candidateFoodIds = dto.candidateFoodIds && dto.candidateFoodIds.length > 0
      ? dto.candidateFoodIds
      : [DEMO_FOOD_OATMEAL_ID, DEMO_FOOD_CHICKEN_SALAD_ID];

    // RecommendationEngineFoundationService.generate executes Safety Engine as Stage 1 internally.
    return this.recommendationEngine.generate({
      userId: targetUserId,
      mealId,
      mealType,
      candidateFoodIds,
    });
  }

  @Public()
  @Post('explain')
  async explainRecommendation(
    @Body()
    dto: {
      mealId?: string;
      mealRecommendationId?: string;
      recommendationPayload?: Record<string, unknown>;
    },
  ) {
    const mealId = dto.mealId || DEMO_MEAL_ID;
    const mealRecommendationId = dto.mealRecommendationId || '88888888-8888-8888-8888-888888888888';
    const payload = dto.recommendationPayload || {
      title: 'Healthy Berry Oatmeal Bowl',
      mealType: 'BREAKFAST',
      estimatedCalories: 320,
    };

    return this.explainabilityEngine.explain({
      mealId,
      mealRecommendationId,
      recommendationPayload: payload,
    });
  }

  @Public()
  @Get('demo-flow')
  async runFullDemoFlow() {
    const env = this.configService.get('nodeEnv', { infer: true }) || process.env.NODE_ENV;
    if (env === 'production') {
      throw new NotFoundException('Endpoint not found');
    }

    // 1. Check unsafe food (Peanut Butter Toast vs Peanut Allergy)
    const unsafeSafetyCheck = await this.safetyEngine.check({
      userId: DEMO_USER_ID,
      proposedFoodIds: [DEMO_FOOD_PEANUT_BUTTER_ID],
    });

    // 2. Check safe food (Oatmeal & Salad)
    const safeSafetyCheck = await this.safetyEngine.check({
      userId: DEMO_USER_ID,
      proposedFoodIds: [DEMO_FOOD_OATMEAL_ID, DEMO_FOOD_CHICKEN_SALAD_ID],
    });

    // 3. Generate Recommendation (executes Safety -> Rules -> Validation -> Formatter)
    const recommendation = await this.recommendationEngine.generate({
      userId: DEMO_USER_ID,
      mealId: DEMO_MEAL_ID,
      mealType: MealType.BREAKFAST,
      candidateFoodIds: [DEMO_FOOD_OATMEAL_ID, DEMO_FOOD_CHICKEN_SALAD_ID],
    });

    return {
      status: 'SUCCESS',
      demoUser: {
        id: DEMO_USER_ID,
        email: 'demo@vcure.com',
        healthProfile: 'Male, 35yr, Weight Loss goal, Type 2 Diabetes, Severe Peanut Allergy',
      },
      safetyCheckUnsafeResult: unsafeSafetyCheck,
      safetyCheckSafeResult: safeSafetyCheck,
      recommendationResult: recommendation,
    };
  }
}

