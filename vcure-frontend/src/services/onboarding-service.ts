import { apiClient } from "@/lib/api-client";
import type {
  OnboardingCompletePayloadDto,
  OnboardingCompleteResponseDto
} from "@/types/onboarding";

export const onboardingService = {
  complete: (payload: OnboardingCompletePayloadDto) =>
    apiClient.post<OnboardingCompleteResponseDto>("/onboarding/complete", payload)
};
