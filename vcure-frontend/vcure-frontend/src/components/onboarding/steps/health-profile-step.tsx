"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import {
  healthProfileSchema,
  type HealthProfileFormValues
} from "@/lib/validation/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";

const BLOOD_GROUP_OPTIONS = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
  { value: "UNKNOWN", label: "I don't know" }
];

function computeBmi(heightCm?: number, weightKg?: number): number | null {
  if (!heightCm || !weightKg || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function HealthProfileStep() {
  const draft = useOnboardingStore((state) => state.draft.healthProfile);
  const updateHealthProfile = useOnboardingStore((state) => state.updateHealthProfile);
  const goNext = useOnboardingStore((state) => state.goNext);
  const goBack = useOnboardingStore((state) => state.goBack);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<HealthProfileFormValues>({
    resolver: zodResolver(healthProfileSchema),
    defaultValues: draft
  });

  const heightCm = useWatch({ control, name: "heightCm" });
  const weightKg = useWatch({ control, name: "weightKg" });
  const bmi = computeBmi(Number(heightCm), Number(weightKg));

  const onSubmit = (values: HealthProfileFormValues) => {
    updateHealthProfile(values);
    goNext();
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <InputField
          label="Height (cm)"
          type="number"
          inputMode="decimal"
          error={errors.heightCm?.message}
          {...register("heightCm")}
        />
        <InputField
          label="Weight (kg)"
          type="number"
          inputMode="decimal"
          error={errors.weightKg?.message}
          {...register("weightKg")}
        />
      </div>

      {bmi !== null ? (
        <div className="rounded-md bg-surface-muted p-3 text-sm text-text-secondary">
          Estimated BMI: <span className="font-semibold text-text-primary">{bmi}</span>
        </div>
      ) : null}

      <SelectField
        label="Blood group"
        options={BLOOD_GROUP_OPTIONS}
        error={errors.bloodGroup?.message}
        {...register("bloodGroup")}
      />

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
