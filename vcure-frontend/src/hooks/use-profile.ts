import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile-service";
import { ApiError } from "@/lib/api-client";
import type { UserProfileFormValues } from "@/lib/validation/profile";
import type {
  HealthProfileFormValues,
  LifestyleFormValues,
  GoalsFormValues
} from "@/lib/validation/onboarding";

export function getProfileErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}

export function useUserProfile() {
  return useQuery({ queryKey: ["profile", "user"], queryFn: profileService.getUserProfile });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserProfileFormValues) => profileService.updateUserProfile(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", "user"] })
  });
}

export function useHealthProfile() {
  return useQuery({
    queryKey: ["profile", "health"],
    queryFn: profileService.getHealthProfile
  });
}

export function useUpdateHealthProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: HealthProfileFormValues) =>
      profileService.updateHealthProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "health"] });
      queryClient.invalidateQueries({ queryKey: ["profile", "completion"] });
    }
  });
}

export function useLifestyleProfile() {
  return useQuery({
    queryKey: ["profile", "lifestyle"],
    queryFn: profileService.getLifestyle
  });
}

export function useUpdateLifestyleProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LifestyleFormValues) => profileService.updateLifestyle(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", "lifestyle"] })
  });
}

export function useHealthGoals() {
  return useQuery({ queryKey: ["profile", "goals"], queryFn: profileService.getGoals });
}

export function useUpdateHealthGoals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GoalsFormValues) => profileService.updateGoals(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile", "goals"] })
  });
}

export function useProfileCompletion() {
  return useQuery({
    queryKey: ["profile", "completion"],
    queryFn: profileService.getCompletion
  });
}
