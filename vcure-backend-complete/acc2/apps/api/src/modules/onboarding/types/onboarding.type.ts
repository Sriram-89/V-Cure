/** Mirrors ACC1 `OnboardingCompleteResponseDto`. */
export interface OnboardingCompleteResponse {
  onboardingCompleted: true;
  bmi: number;
  riskFlags: string[];
}
