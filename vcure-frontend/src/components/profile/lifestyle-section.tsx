"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/profile/section-card";
import { lifestyleSchema, type LifestyleFormValues } from "@/lib/validation/profile";
import {
  useLifestyleProfile,
  useUpdateLifestyleProfile,
  getProfileErrorMessage
} from "@/hooks/use-profile";

const ACTIVITY_OPTIONS = [
  { value: "SEDENTARY", label: "Sedentary" },
  { value: "LIGHTLY_ACTIVE", label: "Lightly active" },
  { value: "MODERATELY_ACTIVE", label: "Moderately active" },
  { value: "VERY_ACTIVE", label: "Very active" }
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

const LABELS: Record<string, string> = Object.fromEntries(
  [...ACTIVITY_OPTIONS, ...SMOKING_OPTIONS, ...ALCOHOL_OPTIONS, ...DIET_OPTIONS].map((o) => [
    o.value,
    o.label
  ])
);

export function LifestyleSection() {
  const [isEditing, setIsEditing] = useState(false);
  const { data, isLoading, isError } = useLifestyleProfile();
  const updateLifestyle = useUpdateLifestyleProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LifestyleFormValues>({
    resolver: zodResolver(lifestyleSchema),
    values: data ? ({ ...data, stressLevel: (data as any).stressLevel || "MODERATE" } as any) : undefined
  });

  const onSubmit = (values: LifestyleFormValues) => {
    updateLifestyle.mutate(values, { onSuccess: () => setIsEditing(false) });
  };

  return (
    <SectionCard
      title="Lifestyle"
      isLoading={isLoading}
      isError={isError}
      isEditing={isEditing}
      onEditToggle={() => {
        reset();
        setIsEditing((prev) => !prev);
      }}
    >
      {isEditing ? (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {updateLifestyle.isError ? (
            <div role="alert" className="flex items-center gap-2 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {getProfileErrorMessage(updateLifestyle.error)}
            </div>
          ) : null}
          <SelectField
            label="Activity level"
            options={ACTIVITY_OPTIONS}
            error={errors.activityLevel?.message}
            {...register("activityLevel")}
          />
          <InputField
            label="Average sleep (hours/night)"
            type="number"
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
            error={(errors as any).dietType?.message}
            {...register("dietType" as any)}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" isLoading={updateLifestyle.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-text-secondary">Activity level</dt>
          <dd className="text-text-primary">{LABELS[data?.activityLevel ?? ""]}</dd>
          <dt className="text-text-secondary">Sleep</dt>
          <dd className="text-text-primary">{data?.sleepHours} hrs/night</dd>
          <dt className="text-text-secondary">Smoking</dt>
          <dd className="text-text-primary">{LABELS[data?.smokingStatus ?? ""]}</dd>
          <dt className="text-text-secondary">Alcohol</dt>
          <dd className="text-text-primary">{LABELS[data?.alcoholConsumption ?? ""]}</dd>
          <dt className="text-text-secondary">Diet</dt>
          <dd className="text-text-primary">{LABELS[data?.dietType ?? ""]}</dd>
        </dl>
      )}
    </SectionCard>
  );
}
