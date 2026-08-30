// Onboarding DTOs — locked to 05_API_CONTRACTS.md Part 5B
// (health-profile, medical-profile, lifestyle, goals) and the
// Business Domain Model in 04_BUSINESS_DOMAIN_MODEL.md.

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type BloodGroup =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE"
  | "UNKNOWN";
export type ActivityLevel =
  | "SEDENTARY"
  | "LIGHTLY_ACTIVE"
  | "MODERATELY_ACTIVE"
  | "VERY_ACTIVE";
export type SmokingStatus = "NEVER" | "FORMER" | "CURRENT";
export type AlcoholConsumption = "NONE" | "OCCASIONAL" | "REGULAR" | "FREQUENT";
export type DietType =
  | "OMNIVORE"
  | "VEGETARIAN"
  | "VEGAN"
  | "PESCATARIAN"
  | "KETO";
export type PrimaryGoal =
  | "WEIGHT_LOSS"
  | "WEIGHT_GAIN"
  | "MANAGE_CONDITION"
  | "IMPROVE_FITNESS"
  | "GENERAL_WELLNESS";
export type GoalTimeline = "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS" | "ONGOING";

export interface PersonalInfoDto {
  dateOfBirth: string; // ISO date
  gender: Gender;
  phone: string;
}

export interface OnboardingHealthProfileInput {
  heightCm: number;
  weightKg: number;
  bloodGroup: BloodGroup;
}

export interface MedicalProfileDto {
  conditions: string[];
  allergies: string[];
  medications: string[];
}

export interface LifestyleAssessmentDto {
  activityLevel: ActivityLevel;
  sleepHours: number;
  smokingStatus: SmokingStatus;
  alcoholConsumption: AlcoholConsumption;
  dietType: DietType;
}

export interface GoalsDto {
  primaryGoal: PrimaryGoal;
  timeline: GoalTimeline;
}

export interface OnboardingCompletePayloadDto {
  personalInfo: PersonalInfoDto;
  healthProfile: OnboardingHealthProfileInput;
  medicalProfile: MedicalProfileDto;
  lifestyle: LifestyleAssessmentDto;
  goals: GoalsDto;
}

export interface OnboardingCompleteResponseDto {
  onboardingCompleted: true;
  bmi: number;
  riskFlags: string[];
}

export const ONBOARDING_STEPS = [
  "personal-info",
  "health-profile",
  "medical-profile",
  "lifestyle",
  "goals",
  "review"
] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];
