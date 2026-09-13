import type { OnboardingDraft } from "@/store/onboarding-store";

/**
 * Deterministic Non-Diagnostic Wellness Health Score Calculator.
 * Evaluates profile metrics (BMI, HbA1c, glucose, diabetes category, activity, sleep, stress, conditions).
 */
export function calculateHealthScore(draft?: Partial<OnboardingDraft> | null): number {
  if (!draft) return 65;

  let score = 85;

  // 1. BMI Calculation
  const heightCm = Number(draft.personalInfo?.heightCm || draft.healthProfile?.heightCm || 170);
  const weightKg = Number(draft.personalInfo?.weightKg || draft.healthProfile?.weightKg || 70);
  const heightMeters = heightCm / 100;
  const bmi = weightKg / (heightMeters * heightMeters);

  if (bmi >= 18.5 && bmi <= 24.9) {
    score += 5; // Normal BMI
  } else if (bmi >= 25 && bmi <= 29.9) {
    score -= 4; // Overweight
  } else if (bmi >= 30) {
    score -= 10; // Obese
  } else if (bmi < 18.5) {
    score -= 3; // Underweight
  }

  // 2. Glycemic Labs (HbA1c & Fasting Glucose)
  const rawHba1c = draft.glucoseLabs?.hba1cPercent;
  if (rawHba1c !== undefined && rawHba1c !== null && String(rawHba1c).trim() !== "") {
    const hba1c = Number(rawHba1c);
    if (!isNaN(hba1c) && hba1c > 0) {
      if (hba1c < 5.7) score += 5;
      else if (hba1c >= 5.7 && hba1c <= 6.4) score -= 6;
      else if (hba1c > 6.4 && hba1c <= 8.0) score -= 14;
      else if (hba1c > 8.0) score -= 22;
    }
  }

  const rawGlucose = draft.glucoseLabs?.fastingGlucoseMgDl;
  if (rawGlucose !== undefined && rawGlucose !== null && String(rawGlucose).trim() !== "") {
    const fastingGlucose = Number(rawGlucose);
    if (!isNaN(fastingGlucose) && fastingGlucose > 0) {
      if (fastingGlucose < 100) score += 3;
      else if (fastingGlucose >= 100 && fastingGlucose <= 125) score -= 5;
      else if (fastingGlucose > 125) score -= 10;
    }
  }

  // 3. Diabetes Category (using exact enum types: PREDIABETES, TYPE1_DIABETES, TYPE2_DIABETES, GESTATIONAL_DIABETES)
  const category = draft.diabetesCategory?.category;
  if (category === "PREDIABETES") score -= 5;
  else if (category === "TYPE2_DIABETES") score -= 12;
  else if (category === "TYPE1_DIABETES") score -= 10;
  else if (category === "GESTATIONAL_DIABETES") score -= 8;

  // 4. Lifestyle Factors
  const activity = draft.lifestyle?.activityLevel;
  if (activity === "VERY_ACTIVE") score += 6;
  else if (activity === "MODERATELY_ACTIVE") score += 3;
  else if (activity === "LIGHTLY_ACTIVE") score -= 2;
  else if (activity === "SEDENTARY") score -= 7;

  const rawSleep = draft.lifestyle?.sleepHours;
  if (rawSleep !== undefined && rawSleep !== null) {
    const sleep = Number(rawSleep);
    if (!isNaN(sleep) && sleep > 0) {
      if (sleep >= 7 && sleep <= 9) score += 4;
      else if (sleep < 6) score -= 5;
    }
  }

  const stress = draft.lifestyle?.stressLevel;
  if (stress === "LOW") score += 4;
  else if (stress === "HIGH") score -= 6;

  // 5. Conditions Count
  const conditionsCount =
    draft.medicalConditions?.conditions?.length || draft.medicalProfile?.conditions?.length || 0;
  score -= conditionsCount * 3;

  return Math.max(30, Math.min(100, Math.round(score)));
}
