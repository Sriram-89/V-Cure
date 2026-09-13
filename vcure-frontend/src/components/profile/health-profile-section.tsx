"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/profile/section-card";
import { healthProfileSchema, type HealthProfileFormValues } from "@/lib/validation/profile";
import {
  useHealthProfile,
  useUpdateHealthProfile,
  getProfileErrorMessage
} from "@/hooks/use-profile";

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

export function HealthProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const { data, isLoading, isError } = useHealthProfile();
  const updateHealthProfile = useUpdateHealthProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<HealthProfileFormValues>({
    resolver: zodResolver(healthProfileSchema),
    values: data
      ? ({ heightCm: data.heightCm, weightKg: data.weightKg, gender: "MALE" } as any)
      : undefined
  });

  const onSubmit = (values: HealthProfileFormValues) => {
    updateHealthProfile.mutate(values, { onSuccess: () => setIsEditing(false) });
  };

  return (
    <SectionCard
      title="Health profile"
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
          {updateHealthProfile.isError ? (
            <div role="alert" className="flex items-center gap-2 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {getProfileErrorMessage(updateHealthProfile.error)}
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Height (cm)"
              type="number"
              error={errors.heightCm?.message}
              {...register("heightCm")}
            />
            <InputField
              label="Weight (kg)"
              type="number"
              error={errors.weightKg?.message}
              {...register("weightKg")}
            />
          </div>
          <SelectField
            label="Blood group"
            options={BLOOD_GROUP_OPTIONS}
            error={(errors as any).bloodGroup?.message}
            {...register("bloodGroup" as any)}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" isLoading={updateHealthProfile.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-text-secondary">Height</dt>
          <dd className="text-text-primary">{data?.heightCm} cm</dd>
          <dt className="text-text-secondary">Weight</dt>
          <dd className="text-text-primary">{data?.weightKg} kg</dd>
          <dt className="text-text-secondary">Blood group</dt>
          <dd className="text-text-primary">{data?.bloodGroup.replace("_", " ")}</dd>
          <dt className="text-text-secondary">BMI</dt>
          <dd className="text-text-primary">{data?.bmi ?? "—"}</dd>
        </dl>
      )}
    </SectionCard>
  );
}
