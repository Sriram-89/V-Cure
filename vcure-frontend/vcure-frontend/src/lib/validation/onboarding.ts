import { z } from "zod";

const isoDateNotFuture = z
  .string()
  .min(1, "Date of birth is required")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date")
  .refine((value) => new Date(value) <= new Date(), "Date of birth can't be in the future");

export const personalInfoSchema = z.object({
  dateOfBirth: isoDateNotFuture,
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
    errorMap: () => ({ message: "Select a gender" })
  }),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number")
    .regex(/^[0-9+\s-]+$/, "Enter a valid phone number")
});
export type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export const healthProfileSchema = z.object({
  heightCm: z.coerce
    .number({ invalid_type_error: "Enter your height" })
    .min(90, "Enter a height between 90cm and 250cm")
    .max(250, "Enter a height between 90cm and 250cm"),
  weightKg: z.coerce
    .number({ invalid_type_error: "Enter your weight" })
    .min(20, "Enter a weight between 20kg and 300kg")
    .max(300, "Enter a weight between 20kg and 300kg"),
  bloodGroup: z.enum(
    [
      "A_POSITIVE",
      "A_NEGATIVE",
      "B_POSITIVE",
      "B_NEGATIVE",
      "AB_POSITIVE",
      "AB_NEGATIVE",
      "O_POSITIVE",
      "O_NEGATIVE",
      "UNKNOWN"
    ],
    { errorMap: () => ({ message: "Select a blood group" }) }
  )
});
export type HealthProfileFormValues = z.infer<typeof healthProfileSchema>;

export const medicalProfileSchema = z.object({
  conditions: z.array(z.string().min(1)).max(20, "Add up to 20 conditions"),
  allergies: z.array(z.string().min(1)).max(20, "Add up to 20 allergies"),
  medications: z.array(z.string().min(1)).max(20, "Add up to 20 medications")
});
export type MedicalProfileFormValues = z.infer<typeof medicalProfileSchema>;

export const lifestyleSchema = z.object({
  activityLevel: z.enum(
    ["SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE"],
    { errorMap: () => ({ message: "Select an activity level" }) }
  ),
  sleepHours: z.coerce
    .number({ invalid_type_error: "Enter average sleep hours" })
    .min(0, "Enter a value between 0 and 24")
    .max(24, "Enter a value between 0 and 24"),
  smokingStatus: z.enum(["NEVER", "FORMER", "CURRENT"], {
    errorMap: () => ({ message: "Select a smoking status" })
  }),
  alcoholConsumption: z.enum(["NONE", "OCCASIONAL", "REGULAR", "FREQUENT"], {
    errorMap: () => ({ message: "Select alcohol consumption" })
  }),
  dietType: z.enum(["OMNIVORE", "VEGETARIAN", "VEGAN", "PESCATARIAN", "KETO"], {
    errorMap: () => ({ message: "Select a diet type" })
  })
});
export type LifestyleFormValues = z.infer<typeof lifestyleSchema>;

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
