"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { lifestyleSchema, type LifestyleFormValues } from "@/lib/validation/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";

const ACTIVITY_OPTIONS = [
  { value: "SEDENTARY", label: "Sedentary — little to no exercise" },
  { value: "LIGHTLY_ACTIVE", label: "Lightly active — 1-3 days/week" },
  { value: "MODERATELY_ACTIVE", label: "Moderately active — 3-5 days/week" },
  { value: "VERY_ACTIVE", label: "Very active — 6-7 days/week" }
];

const SMOKING_OPTIONS = [
  { value: "NEVER", label: "Never smoked" },
  { value: "FORMER", label: "Former smoker" },
  { value: "CURRENT", label: "Current smoker" }
];

const ALCOHOL_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "OCCASIONAL", label: "Occasional" },
  { value: "REGULAR", label: "Regular" },
  { value: "FREQUENT", label: "Frequent" }
];

const DIET_OPTIONS = [
  { value: "OMNIVORE", label: "Omnivore" },
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "VEGAN", label: "Vegan" },
  { value: "PESCATARIAN", label: "Pescatarian" },
  { value: "KETO", label: "Keto" }
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
    defaultValues: draft
  });

  const onSubmit = (values: LifestyleFormValues) => {
    updateLifestyle(values);
    goNext();
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <SelectField
        label="Activity level"
        options={ACTIVITY_OPTIONS}
        error={errors.activityLevel?.message}
        {...register("activityLevel")}
      />

      <InputField
        label="Average sleep (hours/night)"
        type="number"
        inputMode="decimal"
        error={errors.sleepHours?.message}
        {...register("sleepHours")}
      />

      <SelectField
        label="Smoking status"
        options={SMOKING_OPTIONS}
        error={errors.smokingStatus?.message}
        {...register("smokingStatus")}
      />

      <SelectField
        label="Alcohol consumption"
        options={ALCOHOL_OPTIONS}
        error={errors.alcoholConsumption?.message}
        {...register("alcoholConsumption")}
      />

      <SelectField
        label="Diet type"
        options={DIET_OPTIONS}
        error={errors.dietType?.message}
        {...register("dietType")}
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
