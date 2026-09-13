"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Camera, Upload } from "lucide-react";
import { InputField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/profile/section-card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { userProfileSchema, type UserProfileFormValues } from "@/lib/validation/profile";
import { useUserProfile, useUpdateUserProfile, getProfileErrorMessage } from "@/hooks/use-profile";
import { useAuthStore } from "@/store/auth-store";

export function UserProfileSection() {
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data, isLoading, isError } = useUserProfile();
  const updateUserProfile = useUpdateUserProfile();
  const authUser = useAuthStore((state) => state.user);

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const currentAvatar = previewAvatar || data?.avatarUrl || authUser?.avatarUrl || null;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileSchema),
    values: data
      ? {
          fullName: data.fullName,
          phone: data.phone,
          avatarUrl: data.avatarUrl || authUser?.avatarUrl || null
        }
      : undefined
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewAvatar(result);
        setValue("avatarUrl", result, { shouldDirty: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: UserProfileFormValues) => {
    const payload = {
      ...values,
      avatarUrl: previewAvatar !== null ? previewAvatar : values.avatarUrl
    };
    updateUserProfile.mutate(payload, {
      onSuccess: () => {
        setIsEditing(false);
        setPreviewAvatar(null);
      }
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
        setPreviewAvatar(null);
        setIsEditing((prev) => !prev);
      }}
    >
      <div className="flex flex-col gap-4">
        {/* Profile Avatar & Upload Button */}
        <div className="flex items-center gap-4 pb-2 border-b border-gray-100">
          <div className="relative group">
            <UserAvatar
              src={currentAvatar}
              name={data?.fullName || authUser?.fullName || "User"}
              size="lg"
            />
            {isEditing ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full text-white opacity-90 hover:opacity-100 transition-all"
                title="Change profile photo"
              >
                <Camera className="h-5 w-5" />
              </button>
            ) : null}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div>
            <h3 className="text-sm font-bold text-gray-900">Profile Photo</h3>
            <p className="text-[11px] font-medium text-gray-400">
              {isEditing
                ? "Click the camera icon or button to upload a new avatar"
                : "Your photo appears across your personalized V-Cure experience"}
            </p>
            {isEditing ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1.5 text-xs font-bold flex items-center gap-1.5"
              >
                <Upload className="h-3.5 w-3.5" />
                Upload New Image
              </Button>
            ) : null}
          </div>
        </div>

        {isEditing ? (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {updateUserProfile.isError ? (
              <div role="alert" className="flex items-center gap-2 text-sm text-red-600 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                {getProfileErrorMessage(updateUserProfile.error)}
              </div>
            ) : null}
            <InputField label="Full name" error={errors.fullName?.message} {...register("fullName")} />
            <InputField label="Phone number" type="tel" error={errors.phone?.message} {...register("phone")} />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setPreviewAvatar(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={updateUserProfile.isPending}>
                Save photo & profile
              </Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <dt className="text-gray-500 font-medium">Full name</dt>
            <dd className="text-gray-900 font-bold">{data?.fullName || authUser?.fullName || "User"}</dd>
            <dt className="text-gray-500 font-medium">Email</dt>
            <dd className="text-gray-900 font-bold">{data?.email || authUser?.email || "N/A"}</dd>
            <dt className="text-gray-500 font-medium">Phone</dt>
            <dd className="text-gray-900 font-bold">{data?.phone || "N/A"}</dd>
          </dl>
        )}
      </div>
    </SectionCard>
  );
}
