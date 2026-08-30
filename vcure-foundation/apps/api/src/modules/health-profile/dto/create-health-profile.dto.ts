import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ActivityLevel } from '@prisma/client';

const FOOD_PREFERENCES = [
  'vegetarian',
  'non-vegetarian',
  'vegan',
  'eggetarian',
  'jain',
] as const;

export class CreateHealthProfileDto {
  @IsNumber()
  @Min(50)
  @Max(250)
  heightCm!: number;

  @IsNumber()
  @Min(20)
  @Max(400)
  weightKg!: number;

  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(250)
  waistCm?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  budgetPerDayINR?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  healthGoals?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  favoriteFoods?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  dislikedFoods?: string[];

  @IsOptional()
  @IsIn(FOOD_PREFERENCES)
  foodPreference?: (typeof FOOD_PREFERENCES)[number];
}
