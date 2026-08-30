"use client";

import { useOnboardingStore } from "@/store/onboarding-store";
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout";
import { PersonalInfoStep } from "@/components/onboarding/steps/personal-info-step";
import { HealthProfileStep } from "@/components/onboarding/steps/health-profile-step";
import { MedicalProfileStep } from "@/components/onboarding/steps/medical-profile-step";
import { LifestyleStep } from "@/components/onboarding/steps/lifestyle-step";
import { GoalsStep } from "@/components/onboarding/steps/goals-step";
import { ReviewStep } from "@/components/onboarding/steps/review-step";
import type { OnboardingStep } from "@/types/onboarding";

const STEP_COPY: Record<OnboardingStep, { title: string; subtitle: string }> = {
  "personal-info": {
    title: "Tell us about yourself",
    subtitle: "This helps us tailor recommendations to you."
  },
  "health-profile": {
    title: "Your health profile",
    subtitle: "Height, weight, and blood group help us track your baseline."
  },
  "medical-profile": {
    title: "Medical history",
    subtitle: "Conditions, allergies, and medications the safety layer checks against."
  },
  lifestyle: {
    title: "Your lifestyle",
    subtitle: "A quick sense of your daily habits."
  },
  goals: {
    title: "What are you working toward?",
    subtitle: "We'll shape your plan around this."
  },
  review: {
    title: "Review your profile",
    subtitle: "Make sure everything looks right before we build your plan."
  }
};

export default function OnboardingPage() {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const copy = STEP_COPY[currentStep];

  return (
    <OnboardingLayout currentStep={currentStep} title={copy.title} subtitle={copy.subtitle}>
      {currentStep === "personal-info" ? <PersonalInfoStep /> : null}
      {currentStep === "health-profile" ? <HealthProfileStep /> : null}
      {currentStep === "medical-profile" ? <MedicalProfileStep /> : null}
      {currentStep === "lifestyle" ? <LifestyleStep /> : null}
      {currentStep === "goals" ? <GoalsStep /> : null}
      {currentStep === "review" ? <ReviewStep /> : null}
    </OnboardingLayout>
  );
}
