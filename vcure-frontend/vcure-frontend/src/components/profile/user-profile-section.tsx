"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/profile/section-card";
import { userProfileSchema, type UserProfileFormValues } from "@/lib/validation/profile";
import { useUserProfile, useUpdateUserProfile, getProfileErrorMessage } from "@/hooks/use-profile";

export function UserProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const { data, isLoading, isError } = useUserProfile();
  const updateUserProfile = useUpdateUserProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    values: data ? { fullName: data.fullName, phone: data.phone } : undefined
  });

  const onSubmit = (values: UserProfileFormValues) => {
    updateUserProfile.mutate(values, {
      onSuccess: () => setIsEditing(false)
    });
  };

  return (
    <SectionCard
      title="Personal information"
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
          {updateUserProfile.isError ? (
            <div role="alert" className="flex items-center gap-2 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {getProfileErrorMessage(updateUserProfile.error)}
            </div>
          ) : null}
          <InputField label="Full name" error={errors.fullName?.message} {...register("fullName")} />
          <InputField label="Phone number" type="tel" error={errors.phone?.message} {...register("phone")} />
          <div className="flex justify-end">
            <Button type="submit" size="sm" isLoading={updateUserProfile.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      ) : (
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-text-secondary">Full name</dt>
          <dd className="text-text-primary">{data?.fullName}</dd>
          <dt className="text-text-secondary">Email</dt>
          <dd className="text-text-primary">{data?.email}</dd>
          <dt className="text-text-secondary">Phone</dt>
          <dd className="text-text-primary">{data?.phone}</dd>
        </dl>
      )}
    </SectionCard>
  );
}
