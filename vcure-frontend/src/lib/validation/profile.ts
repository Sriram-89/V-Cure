import { z } from "zod";

// Personal info, health profile, lifestyle, and goal schemas are already
// defined in src/lib/validation/onboarding.ts and are reused as-is for
// editing — the shape of the data does not change after onboarding.
export {
  personalInfoSchema,
  healthProfileSchema,
  lifestyleSchema,
  goalsSchema,
  type PersonalInfoFormValues,
  type HealthProfileFormValues,
  type LifestyleFormValues,
  type GoalsFormValues
} from "@/lib/validation/onboarding";

export const userProfileSchema = z.object({
  fullName: z.string().min(2, "Enter your full name").max(100, "Full name is too long"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .max(15, "Enter a valid phone number")
    .regex(/^[0-9+\s-]+$/, "Enter a valid phone number"),
  avatarUrl: z.string().nullable().optional()
});
export type UserProfileFormValues = z.infer<typeof userProfileSchema>;

export const conditionSchema = z.object({
  name: z.string().min(2, "Condition name is required").max(120, "Name is too long"),
  status: z.enum(["ACTIVE", "MANAGED", "RESOLVED"], {
    errorMap: () => ({ message: "Select a status" })
  }),
  diagnosedDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(500, "Keep notes under 500 characters").optional().or(z.literal(""))
});
export type ConditionFormValues = z.infer<typeof conditionSchema>;

export const allergySchema = z.object({
  allergen: z.string().min(2, "Allergen name is required").max(120, "Name is too long"),
  severity: z.enum(["MILD", "MODERATE", "SEVERE"], {
    errorMap: () => ({ message: "Select a severity" })
  }),
  reaction: z.string().max(500, "Keep this under 500 characters").optional().or(z.literal(""))
});
export type AllergyFormValues = z.infer<typeof allergySchema>;

export const medicineSchema = z.object({
  name: z.string().min(2, "Medicine name is required").max(120, "Name is too long"),
  dosage: z.string().min(1, "Enter a dosage").max(60, "Keep this short"),
  frequency: z.string().min(1, "Enter a frequency").max(60, "Keep this short"),
  isOngoing: z.boolean()
});
export type MedicineFormValues = z.infer<typeof medicineSchema>;

export const familyHistorySchema = z.object({
  relation: z.enum(["FATHER", "MOTHER", "SIBLING", "GRANDPARENT", "OTHER"], {
    errorMap: () => ({ message: "Select a relation" })
  }),
  condition: z.string().min(2, "Condition is required").max(120, "Name is too long"),
  notes: z.string().max(500, "Keep notes under 500 characters").optional().or(z.literal(""))
});
export type FamilyHistoryFormValues = z.infer<typeof familyHistorySchema>;

export const deleteAccountSchema = z.object({
  confirmationText: z.literal("DELETE", {
    errorMap: () => ({ message: 'Type "DELETE" to confirm' })
  })
});
