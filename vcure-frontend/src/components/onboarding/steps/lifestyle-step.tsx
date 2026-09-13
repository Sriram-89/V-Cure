"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { lifestyleSchema, type LifestyleFormValues } from "@/lib/validation/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";

const ACTIVITY_OPTIONS = [
  { value: "SEDENTARY", label: "Sedentary (Little or no exercise)" },
  { value: "LIGHTLY_ACTIVE", label: "Lightly Active (1-3 days/week)" },
  { value: "MODERATELY_ACTIVE", label: "Moderately Active (3-5 days/week)" },
  { value: "VERY_ACTIVE", label: "Very Active (6-7 days/week)" }
];

const STRESS_OPTIONS = [
  { value: "LOW", label: "Low stress" },
  { value: "MODERATE", label: "Moderate stress" },
  { value: "HIGH", label: "High stress" }
];

export function LifestyleStep() {
  const draft = useOnboardingStore((state) => state.draft.lifestyle);
  const updateLifestyle = useOnboardingStore((state) => state.updateLifestyle);
  const goNext = useOnboardingStore((state) => state.goNext);
  const goBack = useOnboardingStore((state) => state.goBack);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LifestyleFormValues>({
    resolver: zodResolver(lifestyleSchema),
    defaultValues: {
      activityLevel: draft.activityLevel || "MODERATELY_ACTIVE",
      sleepHours: draft.sleepHours || 7,
      stressLevel: draft.stressLevel || "MODERATE",
      smokingStatus: draft.smokingStatus || "NEVER",
      alcoholConsumption: draft.alcoholConsumption || "NONE"
    }
  });

  const onSubmit = (values: LifestyleFormValues) => {
    updateLifestyle(values);
    goNext();
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <SelectField
        label="Activity Level"
        options={ACTIVITY_OPTIONS}
        error={errors.activityLevel?.message}
        {...register("activityLevel")}
      />

      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="Sleep (hours/night)"
          type="number"
          placeholder="e.g. 7"
          error={errors.sleepHours?.message}
          {...register("sleepHours")}
        />

        <SelectField
          label="Stress Level"
          options={STRESS_OPTIONS}
          error={errors.stressLevel?.message}
          {...register("stressLevel")}
        />
      </div>

      <div className="flex items-center justify-between pt-3">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          className="rounded-2xl border-gray-200 text-xs font-bold text-gray-600"
        >
          ← Back
        </Button>
        <Button type="submit" className="rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700">
          Continue →
        </Button>
      </div>
    </form>
  );
}
