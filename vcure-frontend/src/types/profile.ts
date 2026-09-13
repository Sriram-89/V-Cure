// Profile module DTOs — locked to 04_BUSINESS_DOMAIN_MODEL.md and
// 05_API_CONTRACTS.md Part 5B. Medical history resources (conditions,
// allergies, medicines, family history) are ownership-scoped CRUD
// with soft deletes, per the Medical History module.

import type { BloodGroup, Gender } from "@/types/onboarding";

export interface UserProfileDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  avatarUrl: string | null;
}

export interface HealthProfileDto {
  heightCm: number;
  weightKg: number;
  bloodGroup: BloodGroup;
  bmi: number | null;
  bmiCategory: "UNDERWEIGHT" | "NORMAL" | "OVERWEIGHT" | "OBESE" | null;
  updatedAt: string;
}

export type ConditionStatus = "ACTIVE" | "MANAGED" | "RESOLVED";

export interface MedicalConditionDto {
  id: string;
  name: string;
  status: ConditionStatus;
  diagnosedDate: string | null;
  notes: string | null;
}

export type AllergySeverity = "MILD" | "MODERATE" | "SEVERE";

export interface AllergyDto {
  id: string;
  allergen: string;
  severity: AllergySeverity;
  reaction: string | null;
}

export interface MedicineDto {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  isOngoing: boolean;
}

export type FamilyRelation =
  | "FATHER"
  | "MOTHER"
  | "SIBLING"
  | "GRANDPARENT"
  | "OTHER";

export interface FamilyHistoryDto {
  id: string;
  relation: FamilyRelation;
  condition: string;
  notes: string | null;
}

export interface LifestyleProfileDto {
  activityLevel: "SEDENTARY" | "LIGHTLY_ACTIVE" | "MODERATELY_ACTIVE" | "VERY_ACTIVE";
  sleepHours: number;
  smokingStatus: "NEVER" | "FORMER" | "CURRENT";
  alcoholConsumption: "NONE" | "OCCASIONAL" | "REGULAR" | "FREQUENT";
  dietType: "OMNIVORE" | "VEGETARIAN" | "VEGAN" | "PESCATARIAN" | "KETO";
}

export interface HealthGoalDto {
  primaryGoal:
    | "WEIGHT_LOSS"
    | "WEIGHT_GAIN"
    | "MANAGE_CONDITION"
    | "IMPROVE_FITNESS"
    | "GENERAL_WELLNESS";
  timeline: "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS" | "ONGOING";
  targetWeightKg: number | null;
}

export interface ProfileCompletionDto {
  percentage: number;
  missingSections: string[];
}
