import { z } from 'zod';

/**
 * VALIDATION LAYER — Output Schemas
 *
 * One zod schema per prompt template category, mirroring the JSON contract
 * declared in that template's system prompt (see
 * prompt-templates/content/*.ts). The Validation Layer service uses these to
 * confirm a provider's raw output is well-formed BEFORE it reaches the
 * Formatter — malformed output is rejected here, never patched/guessed.
 */

export const MealRecommendationOutputSchema = z.object({
  recipeId: z.string().uuid().nullable(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'BEVERAGE']),
  title: z.string().min(1),
  reasons: z.array(z.object({ reasonText: z.string().min(1), nutrientFocus: z.string().nullable() })).min(1),
  estimatedCalories: z.number().nonnegative(),
  alternatives: z.array(z.object({ title: z.string().min(1), reason: z.string().min(1) })),
});

export const ExplainabilityOutputSchema = z.object({
  explanation: z.string().min(1),
  keyNutrients: z.array(z.string()),
});

export const LifestyleRecommendationOutputSchema = z.object({
  suggestion: z.string(),
  expectedBenefit: z.string(),
  category: z.enum(['SLEEP', 'ACTIVITY', 'STRESS', 'HYDRATION', 'SCREEN_TIME', 'OTHER']),
});

export const HealthAssessmentOutputSchema = z.object({
  summary: z.string().min(1),
  highlights: z.array(z.string()),
});

export const RiskAnalysisOutputSchema = z.object({
  indicators: z.array(
    z.object({
      label: z.string().min(1),
      explanation: z.string().min(1),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    }),
  ),
  disclaimer: z.string().min(1),
});

export const OCRExtractionOutputSchema = z.object({
  reportDate: z.string().nullable(),
  results: z.array(
    z.object({
      testName: z.string().min(1),
      value: z.string().min(1),
      unit: z.string().nullable(),
      referenceRange: z.string().nullable(),
      isAbnormal: z.boolean(),
    }),
  ),
  confidenceScore: z.number().min(0).max(1),
  requiresManualReview: z.boolean(),
});

export const SafetyValidationOutputSchema = z.object({
  result: z.enum(['PASSED', 'BLOCKED_ALLERGY', 'BLOCKED_MEDICAL_CONDITION', 'BLOCKED_MEDICINE_INTERACTION', 'BLOCKED_OTHER']),
  blockedReason: z.string().nullable(),
  confidence: z.number().min(0).max(1),
});

export const OUTPUT_SCHEMAS_BY_TEMPLATE_NAME: Record<string, z.ZodTypeAny> = {
  meal_recommendation_v1: MealRecommendationOutputSchema,
  explainability_v1: ExplainabilityOutputSchema,
  lifestyle_recommendation_v1: LifestyleRecommendationOutputSchema,
  health_assessment_v1: HealthAssessmentOutputSchema,
  health_risk_analysis_v1: RiskAnalysisOutputSchema,
  ocr_extraction_v1: OCRExtractionOutputSchema,
  safety_validation_v1: SafetyValidationOutputSchema,
  // chat_v1 is free-text (outputFormat: 'text') and intentionally has no schema here.
};
