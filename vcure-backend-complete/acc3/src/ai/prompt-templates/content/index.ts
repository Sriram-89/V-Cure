import { PromptTemplateDefinition } from './recommendation.templates';
import {
  MEAL_RECOMMENDATION_TEMPLATE,
  EXPLAINABILITY_TEMPLATE,
  LIFESTYLE_RECOMMENDATION_TEMPLATE,
  HEALTH_ASSESSMENT_TEMPLATE,
  RISK_ANALYSIS_TEMPLATE,
  CHAT_TEMPLATE,
} from './recommendation.templates';
import { OCR_EXTRACTION_TEMPLATE, SAFETY_VALIDATION_TEMPLATE } from './safety-ocr.templates';

/** Single import surface for every bundled template — used by seed + fallback loader. */
export const ALL_PROMPT_TEMPLATES: PromptTemplateDefinition[] = [
  MEAL_RECOMMENDATION_TEMPLATE,
  EXPLAINABILITY_TEMPLATE,
  LIFESTYLE_RECOMMENDATION_TEMPLATE,
  HEALTH_ASSESSMENT_TEMPLATE,
  RISK_ANALYSIS_TEMPLATE,
  CHAT_TEMPLATE,
  OCR_EXTRACTION_TEMPLATE,
  SAFETY_VALIDATION_TEMPLATE,
];

export const PROMPT_TEMPLATES_BY_NAME: Record<string, PromptTemplateDefinition> = Object.fromEntries(
  ALL_PROMPT_TEMPLATES.map((t) => [t.name, t]),
);

export * from './recommendation.templates';
export * from './safety-ocr.templates';
