import { create } from "zustand";
import { ONBOARDING_STEPS, type OnboardingStep } from "@/types/onboarding";
import type {
  GoalsFormValues,
  HealthProfileFormValues,
  LifestyleFormValues,
  MedicalProfileFormValues,
  PersonalInfoFormValues
} from "@/lib/validation/onboarding";

interface OnboardingDraft {
  personalInfo: Partial<PersonalInfoFormValues>;
  healthProfile: Partial<HealthProfileFormValues>;
  medicalProfile: MedicalProfileFormValues;
  lifestyle: Partial<LifestyleFormValues>;
  goals: Partial<GoalsFormValues>;
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
  updateLifestyle: (values: LifestyleFormValues) => void;
  updateGoals: (values: GoalsFormValues) => void;
  reset: () => void;
}

const initialDraft: OnboardingDraft = {
  personalInfo: {},
  healthProfile: {},
  medicalProfile: { conditions: [], allergies: [], medications: [] },
  lifestyle: {},
  goals: {}
};

export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
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
  updateLifestyle: (values) =>
    set((state) => ({ draft: { ...state.draft, lifestyle: values } })),
  updateGoals: (values) => set((state) => ({ draft: { ...state.draft, goals: values } })),

  reset: () => set({ currentStep: ONBOARDING_STEPS[0], draft: initialDraft })
}));
