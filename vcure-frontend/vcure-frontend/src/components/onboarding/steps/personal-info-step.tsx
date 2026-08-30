"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { Button } from "@/components/ui/button";
import {
  personalInfoSchema,
  type PersonalInfoFormValues
} from "@/lib/validation/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" }
];

export function PersonalInfoStep() {
  const draft = useOnboardingStore((state) => state.draft.personalInfo);
  const updatePersonalInfo = useOnboardingStore((state) => state.updatePersonalInfo);
  const goNext = useOnboardingStore((state) => state.goNext);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: draft
  });

  const onSubmit = (values: PersonalInfoFormValues) => {
    updatePersonalInfo(values);
    goNext();
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      <InputField
        label="Date of birth"
        type="date"
        error={errors.dateOfBirth?.message}
        {...register("dateOfBirth")}
      />

      <SelectField
        label="Gender"
        options={GENDER_OPTIONS}
        error={errors.gender?.message}
        {...register("gender")}
      />

      <InputField
        label="Phone number"
        type="tel"
        placeholder="e.g. +91 98765 43210"
        error={errors.phone?.message}
        {...register("phone")}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}
