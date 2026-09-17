import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ONBOARDING_STEPS, type OnboardingStep } from "@/types/onboarding";
import type {
  AllergiesFormValues,
  DiabetesCategoryFormValues,
  FoodPreferencesFormValues,
  GlucoseLabsFormValues,
  GoalsFormValues,
  HealthProfileFormValues,
  LifestyleFormValues,
  MedicalConditionsFormValues,
  MedicalProfileFormValues,
  MedicationsFormValues,
  PersonalInfoFormValues,
  ReportUploadFormValues
} from "@/lib/validation/onboarding";

export interface OnboardingDraft {
  personalInfo: Partial<PersonalInfoFormValues>;
  healthProfile: Partial<HealthProfileFormValues>;
  medicalProfile: MedicalProfileFormValues;
  goals: Partial<GoalsFormValues>;
  diabetesCategory: Partial<DiabetesCategoryFormValues>;
  glucoseLabs: Partial<GlucoseLabsFormValues>;
  lifestyle: Partial<LifestyleFormValues>;
  foodPreferences: Partial<FoodPreferencesFormValues>;
  allergies: Partial<AllergiesFormValues>;
  medicalConditions: Partial<MedicalConditionsFormValues>;
  medications: Partial<MedicationsFormValues>;
  reportUpload: Partial<ReportUploadFormValues>;
  isCompleted: boolean;
}

interface OnboardingState {
  currentStep: OnboardingStep;
  draft: OnboardingDraft;
  goToStep: (step: OnboardingStep) => void;
  goNext: () => void;
  goBack: () => void;
  updatePersonalInfo: (values: PersonalInfoFormValues) => void;
  updateHealthProfile: (values: HealthProfileFormValues) => void;
  updateMedicalProfile: (values: MedicalProfileFormValues) => void;
  updateGoals: (values: GoalsFormValues) => void;
  updateDiabetesCategory: (values: DiabetesCategoryFormValues) => void;
  updateGlucoseLabs: (values: GlucoseLabsFormValues) => void;
  updateLifestyle: (values: LifestyleFormValues) => void;
  updateFoodPreferences: (values: FoodPreferencesFormValues) => void;
  updateAllergies: (values: AllergiesFormValues) => void;
  updateMedicalConditions: (values: MedicalConditionsFormValues) => void;
  updateMedications: (values: MedicationsFormValues) => void;
  updateReportUpload: (values: ReportUploadFormValues) => void;
  completeOnboarding: () => void;
  reset: () => void;
}

const initialDraft: OnboardingDraft = {
  personalInfo: {},
  healthProfile: {},
  medicalProfile: { conditions: [], allergies: [], medications: [] },
  goals: {},
  diabetesCategory: {},
  glucoseLabs: { dontKnowWillUploadReport: false },
  lifestyle: {},
  foodPreferences: { avoidIngredients: [] },
  allergies: { allergies: [], intolerances: [] },
  medicalConditions: { conditions: [] },
  medications: { medications: [] },
  reportUpload: { userConfirmedFindings: false },
  isCompleted: false
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: ONBOARDING_STEPS[0],
      draft: initialDraft,

      goToStep: (step) => set({ currentStep: step }),

      goNext: () => {
        const index = ONBOARDING_STEPS.indexOf(get().currentStep);
        const next = ONBOARDING_STEPS[Math.min(index + 1, ONBOARDING_STEPS.length - 1)];
        set({ currentStep: next });
      },

      goBack: () => {
        const index = ONBOARDING_STEPS.indexOf(get().currentStep);
        const previous = ONBOARDING_STEPS[Math.max(index - 1, 0)];
        set({ currentStep: previous });
      },

      updatePersonalInfo: (values) =>
        set((state) => ({ draft: { ...state.draft, personalInfo: values } })),
      updateHealthProfile: (values) =>
        set((state) => ({ draft: { ...state.draft, healthProfile: values } })),
      updateMedicalProfile: (values) =>
        set((state) => ({ draft: { ...state.draft, medicalProfile: values } })),
      updateGoals: (values) =>
        set((state) => ({ draft: { ...state.draft, goals: values } })),
      updateDiabetesCategory: (values) =>
        set((state) => ({ draft: { ...state.draft, diabetesCategory: values } })),
      updateGlucoseLabs: (values) =>
        set((state) => ({ draft: { ...state.draft, glucoseLabs: values } })),
      updateLifestyle: (values) =>
        set((state) => ({ draft: { ...state.draft, lifestyle: values } })),
      updateFoodPreferences: (values) =>
        set((state) => ({ draft: { ...state.draft, foodPreferences: values } })),
      updateAllergies: (values) =>
        set((state) => ({ draft: { ...state.draft, allergies: values } })),
      updateMedicalConditions: (values) =>
        set((state) => ({ draft: { ...state.draft, medicalConditions: values } })),
      updateMedications: (values) =>
        set((state) => ({ draft: { ...state.draft, medications: values } })),
      updateReportUpload: (values) =>
        set((state) => ({ draft: { ...state.draft, reportUpload: values } })),

      completeOnboarding: () =>
        set((state) => ({ draft: { ...state.draft, isCompleted: true } })),

      reset: () => set({ currentStep: ONBOARDING_STEPS[0], draft: initialDraft })
    }),
    {
      name: "vcure-onboarding-draft",
      partialize: (state) => ({
        currentStep: state.currentStep,
        draft: state.draft
      })
    }
  )
);
