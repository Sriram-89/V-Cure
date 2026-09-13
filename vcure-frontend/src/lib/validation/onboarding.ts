import { z } from "zod";

// Step 1: Personal Info
export const personalInfoSchema = z.object({
  fullName: z.string().min(2, "Enter your full name").optional(),
  age: z.coerce.number().min(1, "Enter a valid age").max(120, "Enter a valid age").optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
    errorMap: () => ({ message: "Select a gender" })
  }),
  heightCm: z.coerce
    .number({ invalid_type_error: "Enter your height in cm" })
    .min(90, "Enter height between 90cm and 250cm")
    .max(250, "Enter height between 90cm and 250cm"),
  weightKg: z.coerce
    .number({ invalid_type_error: "Enter your weight in kg" })
    .min(20, "Enter weight between 20kg and 300kg")
    .max(300, "Enter weight between 20kg and 300kg")
});
export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

// Step 2: Diabetes / Health Category
export const diabetesCategorySchema = z.object({
  category: z.enum(
    ["PREDIABETES", "TYPE1_DIABETES", "TYPE2_DIABETES", "GESTATIONAL_DIABETES", "NO_DIABETES", "OTHER"],
    { errorMap: () => ({ message: "Select a health category" }) }
  ),
  duration: z.enum(
    ["LESS_THAN_6_MONTHS", "SIX_MONTHS_TO_1_YEAR", "ONE_TO_3_YEARS", "THREE_TO_5_YEARS", "MORE_THAN_5_YEARS", "NOT_SURE"]
  ).optional().default("NOT_SURE"),
  isGestational: z.boolean().default(false),
  notes: z.string().optional()
});
export type DiabetesCategoryFormValues = z.infer<typeof diabetesCategorySchema>;

// Step 3: Glucose & Lab Information
export const glucoseLabsSchema = z.object({
  fastingGlucoseMgDl: z.coerce.number().min(40).max(600).optional().or(z.literal("")),
  randomGlucoseMgDl: z.coerce.number().min(40).max(600).optional().or(z.literal("")),
  hba1cPercent: z.coerce.number().min(3).max(20).optional().or(z.literal("")),
  dontKnowWillUploadReport: z.boolean().default(false)
});
export type GlucoseLabsFormValues = z.infer<typeof glucoseLabsSchema>;

// Step 4: Lifestyle
export const lifestyleSchema = z.object({
  activityLevel: z.enum(
    ["SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE"],
    { errorMap: () => ({ message: "Select an activity level" }) }
  ),
  sleepHours: z.coerce
    .number({ invalid_type_error: "Enter average sleep hours" })
    .min(1, "Enter a value between 1 and 24")
    .max(24, "Enter a value between 1 and 24"),
  stressLevel: z.enum(["LOW", "MODERATE", "HIGH"], {
    errorMap: () => ({ message: "Select stress level" })
  }),
  smokingStatus: z.enum(["NEVER", "FORMER", "CURRENT"]).default("NEVER"),
  alcoholConsumption: z.enum(["NONE", "OCCASIONAL", "REGULAR", "FREQUENT"]).default("NONE")
});
export type LifestyleFormValues = z.infer<typeof lifestyleSchema>;

// Step 5: Food Preferences
export const foodPreferencesSchema = z.object({
  dietType: z.enum(
    ["OMNIVORE", "VEGETARIAN", "EGGETARIAN", "VEGAN", "PESCATARIAN", "KETO"],
    { errorMap: () => ({ message: "Select a diet preference" }) }
  ),
  regionalCuisine: z.enum(
    ["ANDHRA", "TELANGANA", "TAMIL_NADU", "KARNATAKA", "KERALA", "MAHARASHTRA", "NORTH_INDIAN", "BENGALI", "OTHER"]
  ).default("ANDHRA"),
  eggPreference: z.boolean().default(false),
  avoidIngredients: z.array(z.string()).default([])
});
export type FoodPreferencesFormValues = z.infer<typeof foodPreferencesSchema>;

// Step 6: Allergies
export const allergiesSchema = z.object({
  allergies: z.array(z.string()).default([]),
  intolerances: z.array(z.string()).default([])
});
export type AllergiesFormValues = z.infer<typeof allergiesSchema>;

// Step 7: Medical Conditions
export const medicalConditionsSchema = z.object({
  conditions: z.array(z.string()).default([])
});
export type MedicalConditionsFormValues = z.infer<typeof medicalConditionsSchema>;

// Step 8: Medications
export const medicationsSchema = z.object({
  medications: z.array(z.string()).default([])
});
export type MedicationsFormValues = z.infer<typeof medicationsSchema>;

// Step 9: Report Upload
export const reportUploadSchema = z.object({
  fileName: z.string().optional(),
  ocrStatus: z.enum(["COMPLETED", "MANUAL_REVIEW_REQUIRED", "FAILED"]).optional(),
  extractedBiomarkers: z.array(z.any()).optional(),
  userConfirmedFindings: z.boolean().default(false)
});
export type ReportUploadFormValues = z.infer<typeof reportUploadSchema>;

// Legacy compatibility exports
export const healthProfileSchema = personalInfoSchema;
export type HealthProfileFormValues = PersonalInfoFormValues;

export const medicalProfileSchema = z.object({
  conditions: z.array(z.string()),
  allergies: z.array(z.string()),
  medications: z.array(z.string())
});
export type MedicalProfileFormValues = z.infer<typeof medicalProfileSchema>;

export const goalsSchema = z.object({
  primaryGoal: z.enum(
    ["WEIGHT_LOSS", "WEIGHT_GAIN", "MANAGE_CONDITION", "IMPROVE_FITNESS", "GENERAL_WELLNESS"],
    { errorMap: () => ({ message: "Select a primary goal" }) }
  ),
  timeline: z.enum(["ONE_MONTH", "THREE_MONTHS", "SIX_MONTHS", "ONGOING"], {
    errorMap: () => ({ message: "Select a timeline" })
  })
});
export type GoalsFormValues = z.infer<typeof goalsSchema>;
