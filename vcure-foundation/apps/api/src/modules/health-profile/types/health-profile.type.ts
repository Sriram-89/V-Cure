import { ActivityLevel } from '@prisma/client';

export type BmiCategory =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obese';

export interface HealthProfileResponse {
  id: string;
  userId: string;
  heightCm: number;
  weightKg: number;
  waistCm: number | null;
  bmi: number;
  bmiCategory: BmiCategory;
  occupation: string | null;
  activityLevel: ActivityLevel;
  budgetPerDayINR: number | null;
  healthGoals: string[];
  favoriteFoods: string[];
  dislikedFoods: string[];
  foodPreference: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthProfileTrendPoint {
  id: string;
  heightCm: number;
  weightKg: number;
  waistCm: number | null;
  bmi: number;
  bmiCategory: BmiCategory;
  recordedAt: Date;
}
