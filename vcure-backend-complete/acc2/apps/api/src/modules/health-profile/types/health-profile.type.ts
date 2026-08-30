import { ActivityLevelEnum, BloodGroup, GoalTimeline, PrimaryGoal } from '@prisma/client';

/**
 * Public API representation (ACC1 contract: UPPERCASE). D-4 requires one
 * canonical casing across every endpoint — never lowercase in one response
 * and uppercase in another.
 */
export type BmiCategory =
  | 'UNDERWEIGHT'
  | 'NORMAL'
  | 'OVERWEIGHT'
  | 'OBESE';

export interface HealthProfileResponse {
  id: string;
  userId: string;
  heightCm: number;
  weightKg: number;
  waistCm: number | null;
  bmi: number;
  bmiCategory: BmiCategory;
  activityLevel: ActivityLevelEnum;
  /// ACC1 contract: HealthProfileDto.bloodGroup
  bloodGroup: BloodGroup | null;
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

/** ACC1 `HealthGoalDto` for GET/PATCH /goals. */
export interface HealthGoalResponse {
  primaryGoal: PrimaryGoal | null;
  timeline: GoalTimeline | null;
  targetWeightKg: number | null;
}
