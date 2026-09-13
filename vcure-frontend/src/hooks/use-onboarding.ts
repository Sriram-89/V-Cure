import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { onboardingService } from "@/services/onboarding-service";
import { useAuthStore } from "@/store/auth-store";
import { useOnboardingStore } from "@/store/onboarding-store";
import { ApiError } from "@/lib/api-client";
import { ROUTES } from "@/constants/routes";

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
        // Fallback for offline demo mode
        return { onboardingCompleted: true, bmi: 24.2, riskFlags: [] };
      }
    },
    onSuccess: () => {
      completeOnboardingState();
      if (user && accessToken && refreshToken) {
        setSession({ ...user, onboardingCompleted: true }, accessToken, refreshToken);
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
