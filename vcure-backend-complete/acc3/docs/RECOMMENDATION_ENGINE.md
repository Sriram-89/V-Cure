# Recommendation Engine Foundation Documentation

## Scope

This is explicitly the **foundation** (Phase 2 item 11), not the full
Recommendation Engine. It exists so every later addition — candidate
selection strategy, ranking, multi-meal-plan composition, feedback-loop
weighting — has a safety-correct scaffold to extend rather than re-deriving
pipeline order each time. See `src/ai/recommendation-engine/recommendation-engine-foundation.service.ts`
for the full inline rationale.

## What it does today

Given `{ userId, mealId, mealType, candidateFoodIds }`, it:

1. Validates input (zod).
2. Runs the Safety Engine — hard stop on any block.
3. Runs Medical + Nutrition Rule Engines in parallel — hard stop only if a
   future rule reports a `BLOCKING` finding (none currently do; see
   `docs/SAFETY_ENGINE.md` for why blocking lives in Safety Engine only).
4. Builds a prompt via `meal_recommendation_v1`, calls the AI provider
   resolved for purpose `meal_recommendation`.
5. Validates the raw response against `MealRecommendationOutputSchema`.
6. Persists `MealRecommendation` + `MealReason` rows.
7. Calls the Explainability Engine for a richer explanation (best-effort;
   failure here doesn't fail the overall call).
8. Formats the final `PipelineResult<MealRecommendationPayload>`.
9. Writes a `RecommendationLog` row — **always**, on every code path,
   success or failure — via a single `logRecommendation()` helper called
   from every early-return branch.

## What it deliberately does NOT do yet

- **Candidate sourcing.** The caller supplies `candidateFoodIds` — this
  foundation doesn't yet query the Food/Recipe catalog for "what's plausible
  for this user" (that's catalog-filtering logic for a future Recommendation
  Engine iteration, likely combined with the Nutrition Rule Engine's
  calorie/macro logic to pre-filter rather than just warn).
- **Multi-meal-plan composition.** One meal slot per call; `MealPlan`
  orchestration across a full day is out of scope here.
- **Feedback-loop weighting.** `RecommendationFeedback` (Phase 1 schema)
  exists but nothing in this phase reads it yet to influence future
  generations.
- **A/B or ranking logic.** The AI provider returns one recommendation +
  alternatives in the same call; there's no separate ranking/scoring pass.

## Failure modes and their `errorCode`

| `errorCode` | Stage | Meaning |
|---|---|---|
| `INPUT_VALIDATION_FAILED` | pre-pipeline | Malformed request; no engine touched |
| `SAFETY_BLOCKED` | SAFETY | See `SafetyValidation.blockedReason` |
| `RULE_ENGINE_REJECTED` | RULE | Reserved for a future `BLOCKING` medical/nutrition finding |
| `PIPELINE_STAGE_FAILED` | (AI call) | Provider unavailable/timeout/rate-limited |
| `OUTPUT_VALIDATION_FAILED` | VALIDATION | Provider returned malformed or off-schema JSON |

Every one of these is exercised by `src/ai/tests/recommendation-engine.spec.ts`
and, for the full real-class chain, `src/ai/tests/ai-integration.spec.ts`.

## Logging contract

`RecommendationLog.inputSnapshot` / `outputSnapshot` store the validated
request object and the formatted payload — **never** the `messages` array
sent to the provider (see `src/ai/tests/security.spec.ts` "Sensitive Data
Protection" for the structural assertion backing this).
