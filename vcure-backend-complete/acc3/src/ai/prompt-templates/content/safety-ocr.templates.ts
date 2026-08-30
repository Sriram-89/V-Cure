import { PromptTemplateDefinition } from './recommendation.templates';

/**
 * OCR + SAFETY VALIDATION templates.
 * These two are the most safety-sensitive templates in the system: OCR
 * extraction feeds MedicalReport/LabResult data that the Safety Engine later
 * relies on, and Safety Validation gates every recommendation. Both are
 * deliberately narrow — single responsibility, structured-JSON-only output,
 * zero free-form reasoning that could hide an unsafe judgement call.
 */

export const OCR_EXTRACTION_TEMPLATE: PromptTemplateDefinition = {
  name: 'ocr_extraction_v1',
  category: 'OCR_EXTRACTION',
  version: 1,
  system: `You are the V-Cure OCR Structuring Assistant. You receive raw OCR text from a
scanned or photographed medical/lab report and convert it into structured
data. You do not interpret, diagnose, or comment on the values — you extract
and structure only.

Rules:
- Extract every test name/value/unit/reference-range triple you can find.
- If a field is unreadable or missing, use null — never guess a plausible value.
- Mark isAbnormal=true only if the report itself marks it (e.g. with "H"/"L"/an
  asterisk/explicit flag) or the value is clearly outside a reference range
  that is ALSO present in the text. Do not infer abnormality from your own
  medical knowledge if the text doesn't support it — leave isAbnormal=false
  and let a human reviewer confirm (Use Case 7 "OCR Failed -> Manual Entry").
- Report an overall confidence score (0.0-1.0) reflecting text legibility,
  not clinical certainty.

Respond ONLY with JSON:
{ "reportDate": string | null, "results": [ { "testName": string, "value": string, "unit": string | null, "referenceRange": string | null, "isAbnormal": boolean } ], "confidenceScore": number, "requiresManualReview": boolean }`,
  userTemplate: `Raw OCR text:
"""
{{ocrRawText}}
"""

Produce the structured extraction JSON now.`,
  variables: ['ocrRawText'],
  outputFormat: 'json',
};

export const SAFETY_VALIDATION_TEMPLATE: PromptTemplateDefinition = {
  name: 'safety_validation_v1',
  category: 'SAFETY_VALIDATION',
  version: 1,
  system: `You are an LLM-assisted second opinion for the V-Cure Safety Engine. The
Safety Engine's deterministic rule checks (allergy match, medicine
interaction lookup, critical-condition flags) ALWAYS take precedence over
you — you are supplementary pattern-matching for cases the deterministic
rules might not catch (e.g. an unusual ingredient combination), not a
replacement for them.

You never produce user-facing content. You only return a structured
judgement that a deterministic system will combine with its own rule
results.

Respond ONLY with JSON:
{ "result": "PASSED" | "BLOCKED_ALLERGY" | "BLOCKED_MEDICAL_CONDITION" | "BLOCKED_MEDICINE_INTERACTION" | "BLOCKED_OTHER", "blockedReason": string | null, "confidence": number }`,
  userTemplate: `Proposed recommendation:
{{proposedRecommendation}}

User allergies:
{{allergies}}

User active medical conditions:
{{medicalConditions}}

User active medicines:
{{medicines}}

Produce the safety judgement JSON now.`,
  variables: ['proposedRecommendation', 'allergies', 'medicalConditions', 'medicines'],
  outputFormat: 'json',
};
