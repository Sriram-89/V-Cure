"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useCompleteOnboarding, getOnboardingErrorMessage } from "@/hooks/use-onboarding";
import type {
  GoalsFormValues,
  HealthProfileFormValues,
  LifestyleFormValues,
  PersonalInfoFormValues
} from "@/lib/validation/onboarding";

const LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
  PREFER_NOT_TO_SAY: "Prefer not to say",
  SEDENTARY: "Sedentary",
  LIGHTLY_ACTIVE: "Lightly active",
  MODERATELY_ACTIVE: "Moderately active",
  VERY_ACTIVE: "Very active",
  NEVER: "Never",
  FORMER: "Former",
  CURRENT: "Current",
  NONE: "None",
  OCCASIONAL: "Occasional",
  REGULAR: "Regular",
  FREQUENT: "Frequent",
  OMNIVORE: "Omnivore",
  VEGETARIAN: "Vegetarian",
  VEGAN: "Vegan",
  PESCATARIAN: "Pescatarian",
  KETO: "Keto",
  WEIGHT_LOSS: "Lose weight",
  WEIGHT_GAIN: "Gain weight",
  MANAGE_CONDITION: "Manage a condition",
  IMPROVE_FITNESS: "Improve fitness",
  GENERAL_WELLNESS: "General wellness",
  ONE_MONTH: "1 month",
  THREE_MONTHS: "3 months",
  SIX_MONTHS: "6 months",
  ONGOING: "Ongoing"
};

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 text-sm last:border-none">
      <span className="text-text-secondary">{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}

export function ReviewStep() {
  const draft = useOnboardingStore((state) => state.draft);
  const goBack = useOnboardingStore((state) => state.goBack);
  const goToStep = useOnboardingStore((state) => state.goToStep);
  const completeOnboarding = useCompleteOnboarding();

  const personalInfo = draft.personalInfo as PersonalInfoFormValues;
  const healthProfile = draft.healthProfile as HealthProfileFormValues;
  const lifestyle = draft.lifestyle as LifestyleFormValues;
  const goals = draft.goals as GoalsFormValues;

  const handleSubmit = () => {
    completeOnboarding.mutate({
      personalInfo,
      healthProfile,
      medicalProfile: draft.medicalProfile,
      lifestyle,
      goals
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {completeOnboarding.isError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-danger/20 bg-red-50 p-3 text-sm text-danger"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {getOnboardingErrorMessage(completeOnboarding.error)}
        </div>
      ) : null}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Personal info</h2>
          <button
            type="button"
            onClick={() => goToStep("personal-info")}
            className="text-xs font-medium text-primary hover:text-primary-700"
          >
            Edit
          </button>
        </div>
        <ReviewRow label="Date of birth" value={(personalInfo as any)?.dateOfBirth ?? "—"} />
        <ReviewRow label="Gender" value={LABELS[personalInfo?.gender ?? ""] ?? "—"} />
        <ReviewRow label="Phone" value={(personalInfo as any)?.phone ?? "—"} />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Health profile</h2>
          <button
            type="button"
            onClick={() => goToStep("personal-info")}
            className="text-xs font-medium text-primary hover:text-primary-700"
          >
            Edit
          </button>
        </div>
        <ReviewRow label="Height" value={`${personalInfo?.heightCm ?? "—"} cm`} />
        <ReviewRow label="Weight" value={`${personalInfo?.weightKg ?? "—"} kg`} />
        <ReviewRow
          label="Blood group"
          value={(healthProfile as any)?.bloodGroup?.replace("_", " ") ?? "—"}
        />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Medical profile</h2>
          <button
            type="button"
            onClick={() => goToStep("medical-conditions" as any)}
            className="text-xs font-medium text-primary hover:text-primary-700"
          >
            Edit
          </button>
        </div>
        <div className="flex flex-wrap gap-2 py-2">
          {draft.medicalProfile.conditions.length === 0 &&
          draft.medicalProfile.allergies.length === 0 &&
          draft.medicalProfile.medications.length === 0 ? (
            <span className="text-sm text-text-secondary">Nothing added</span>
          ) : (
            [
              ...draft.medicalProfile.conditions,
              ...draft.medicalProfile.allergies,
              ...draft.medicalProfile.medications
            ].map((item) => (
              <Badge key={item} variant="neutral">
                {item}
              </Badge>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Lifestyle</h2>
          <button
            type="button"
            onClick={() => goToStep("lifestyle")}
            className="text-xs font-medium text-primary hover:text-primary-700"
          >
            Edit
          </button>
        </div>
        <ReviewRow
          label="Activity level"
          value={LABELS[lifestyle?.activityLevel ?? ""] ?? "—"}
        />
        <ReviewRow label="Sleep" value={`${lifestyle?.sleepHours ?? "—"} hrs/night`} />
        <ReviewRow label="Diet" value={LABELS[draft.foodPreferences?.dietType ?? ""] ?? "—"} />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">Goals</h2>
          <button
            type="button"
            onClick={() => goToStep("lifestyle" as any)}
            className="text-xs font-medium text-primary hover:text-primary-700"
          >
            Edit
          </button>
        </div>
        <ReviewRow label="Primary goal" value={LABELS[goals?.primaryGoal ?? ""] ?? "—"} />
        <ReviewRow label="Timeline" value={LABELS[goals?.timeline ?? ""] ?? "—"} />
      </section>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          isLoading={completeOnboarding.isPending}
        >
          Complete setup
        </Button>
      </div>
    </div>
  );
}
