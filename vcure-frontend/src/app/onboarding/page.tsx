"use client";

import { useOnboardingStore } from "@/store/onboarding-store";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { PersonalInfoStep } from "@/components/onboarding/steps/personal-info-step";
import { DiabetesCategoryStep } from "@/components/onboarding/steps/diabetes-category-step";
import { GlucoseLabsStep } from "@/components/onboarding/steps/glucose-labs-step";
import { LifestyleStep } from "@/components/onboarding/steps/lifestyle-step";
import { FoodPreferencesStep } from "@/components/onboarding/steps/food-preferences-step";
import { AllergiesStep } from "@/components/onboarding/steps/allergies-step";
import { MedicalConditionsStep } from "@/components/onboarding/steps/medical-conditions-step";
import { MedicationsStep } from "@/components/onboarding/steps/medications-step";
import { ReportUploadStep } from "@/components/onboarding/steps/report-upload-step";
import type { OnboardingStep } from "@/types/onboarding";

const STEP_COPY: Record<OnboardingStep, { title: string; subtitle: string }> = {
  "personal-info": {
    title: "1. Personal Information",
    subtitle: "Baseline profile data for BMI and metabolic target calculation."
  },
  "diabetes-category": {
    title: "2. Health & Diabetes Category",
    subtitle: "Select your metabolic condition to shape your recommendation rules."
  },
  "glucose-labs": {
    title: "3. Glucose & Lab Information",
    subtitle: "Enter available blood glucose and HbA1c values, or upload a report."
  },
  lifestyle: {
    title: "4. Lifestyle Assessment",
    subtitle: "Activity level, sleep habits, and stress information."
  },
  "food-preferences": {
    title: "5. Dietary Preferences",
    subtitle: "Select your food choices so meal recommendations match your diet."
  },
  allergies: {
    title: "6. Food Allergies & Safety",
    subtitle: "Select allergies to be hard-blocked by V-Cure's Safety Engine."
  },
  "medical-conditions": {
    title: "7. Other Health Conditions",
    subtitle: "Diagnosed conditions for renal, hepatic, or cardiovascular rules."
  },
  medications: {
    title: "8. Current Medications",
    subtitle: "Cross-referenced with drug-food interaction safety rules."
  },
  "report-upload": {
    title: "9. Medical Report Upload & Review",
    subtitle: "Upload lab reports for OCR extraction and confirm health findings."
  }
};

export default function OnboardingPage() {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const copy = STEP_COPY[currentStep];

  return (
    <OnboardingLayout currentStep={currentStep} title={copy.title} subtitle={copy.subtitle}>
      {currentStep === "personal-info" ? <PersonalInfoStep /> : null}
      {currentStep === "diabetes-category" ? <DiabetesCategoryStep /> : null}
      {currentStep === "glucose-labs" ? <GlucoseLabsStep /> : null}
      {currentStep === "lifestyle" ? <LifestyleStep /> : null}
      {currentStep === "food-preferences" ? <FoodPreferencesStep /> : null}
      {currentStep === "allergies" ? <AllergiesStep /> : null}
      {currentStep === "medical-conditions" ? <MedicalConditionsStep /> : null}
      {currentStep === "medications" ? <MedicationsStep /> : null}
      {currentStep === "report-upload" ? <ReportUploadStep /> : null}
    </OnboardingLayout>
  );
}
