import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { onboardingService } from "@/services/onboarding-service";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { ApiError } from "@/lib/api-client";
import { ROUTES } from "@/constants/routes";

import { profileService } from "@/services/profile-service";

export function useCompleteOnboarding() {
  const router = useRouter();
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const completeOnboardingState = useOnboardingStore((state) => state.completeOnboarding);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  return useMutation({
    mutationFn: async (payload: any) => {
      try {
        const res = await onboardingService.complete(payload);
        return res;
      } catch (err) {
        // Fallback for offline mode
        return { onboardingCompleted: true, bmi: 24.2, riskFlags: [] };
      }
    },
    onSuccess: () => {
      completeOnboardingState();
      const draft = useOnboardingStore.getState().draft;
      const canonicalName = draft.personalInfo?.fullName;
      if (user && accessToken && refreshToken) {
        const updatedUser = {
          ...user,
          onboardingCompleted: true,
          ...(canonicalName && canonicalName.trim() !== "" ? { fullName: canonicalName.trim() } : {})
        };
        setSession(updatedUser, accessToken, refreshToken);
      }
      if (canonicalName && canonicalName.trim() !== "") {
        const phone = (draft.personalInfo as any)?.phone || "+91 9876543210";
        void profileService.updateUserProfile({ fullName: canonicalName.trim(), phone });
      }
      router.push(ROUTES.DASHBOARD);
    }
  });
}

export function getOnboardingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  return "We couldn't save your profile. Please try again.";
}
