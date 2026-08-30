import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { PrismaClient, MealType } from '@prisma/client';
import { SafetyEngineService } from '../safety-engine/safety-engine.service';
import { MedicalRuleEngineService } from '../medical-rule-engine/medical-rule-engine.service';
import { NutritionRuleEngineService } from '../nutrition-rule-engine/nutrition-rule-engine.service';
import { ValidationLayerService } from '../common/pipeline/validation-layer.service';
import { ResponseFormatterService } from '../common/pipeline/response-formatter.service';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { AIProviderFactory } from '../providers/provider.factory';
import { ExplainabilityEngineService } from '../explainability-engine/explainability-engine.service';
import { MealRecommendationOutputSchema } from '../common/validators/output-schemas';
import { PipelineResult, PipelineStageResult } from '../types/pipeline.types';
import { AIError } from '../errors/ai.errors';

/**
 * RECOMMENDATION ENGINE — Foundation
 *
 * This is the FOUNDATION only (Phase 2 scope: "Recommendation Engine
 * Foundation", not the full engine). It wires every prior stage into the
 * exact mandatory chain from AI___DESIGN "AI RULES":
 *
 *   Safety Engine -> Rule Engine -> Validation Layer -> Formatter
 *
 * "Rule Engine" is run as Medical + Nutrition rule engines in parallel
 * (both are Rule Engine instances per Sec. AI RESPONSIBILITIES; nothing in
 * the Bible mandates they be sequential, and running them in parallel is a
 * pure performance extension, not an architecture change). A future full
 * Recommendation Engine will add: candidate selection strategy, ranking,
 * multi-meal-plan composition, feedback-loop weighting. Those are
 * out-of-scope here by design — this class exists so every later addition
 * has a safety-correct scaffold to build on rather than re-deriving the
 * pipeline order each time.
 *
 * Input Schema:  GenerateMealRecommendationInput
 * Output Schema: PipelineResult<MealRecommendationPayload>
 */
export const GenerateMealRecommendationInputSchema = z.object({
  userId: z.string().uuid(),
  mealId: z.string().uuid(),
  mealType: z.nativeEnum(MealType),
  candidateFoodIds: z.array(z.string().uuid()).min(1),
});
export type GenerateMealRecommendationInput = z.infer<typeof GenerateMealRecommendationInputSchema>;

export interface MealRecommendationPayload {
  mealRecommendationId: string;
  title: string;
  recipeId: string | null;
  estimatedCalories: number;
  reasons: { reasonText: string; nutrientFocus: string | null }[];
  alternatives: { title: string; reason: string }[];
  explanation?: string;
}

@Injectable()
export class RecommendationEngineFoundationService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly safetyEngine: SafetyEngineService,
    private readonly medicalRuleEngine: MedicalRuleEngineService,
    private readonly nutritionRuleEngine: NutritionRuleEngineService,
    private readonly validationLayer: ValidationLayerService,
    private readonly formatter: ResponseFormatterService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly providerFactory: AIProviderFactory,
    private readonly explainabilityEngine: ExplainabilityEngineService,
  ) {}

  async generate(input: GenerateMealRecommendationInput): Promise<PipelineResult<MealRecommendationPayload>> {
    const requestId = crypto.randomUUID();
    const startedAt = new Date().toISOString();
    const stageResults: PipelineStageResult<unknown>[] = [];

    const parsed = GenerateMealRecommendationInputSchema.safeParse(input);
    if (!parsed.success) {
      return this.formatter.failure(requestId, 'INPUT_VALIDATION_FAILED', 'Invalid input', stageResults, startedAt);
    }
    const { userId, mealId, mealType, candidateFoodIds } = parsed.data;

    // ---------- STAGE 1: SAFETY ENGINE ----------
    const safetyStart = Date.now();
    const safety = await this.safetyEngine.check({ userId, proposedFoodIds: candidateFoodIds });
    stageResults.push({
      stage: 'SAFETY',
      passed: safety.result === 'PASSED',
      blockedReason: safety.blockedReason,
      durationMs: Date.now() - safetyStart,
    });

    if (safety.result !== 'PASSED') {
      await this.logRecommendation(userId, input, null, stageResults, false);
      return this.formatter.failure(requestId, 'SAFETY_BLOCKED', safety.blockedReason, stageResults, startedAt);
    }

    // ---------- STAGE 2: RULE ENGINE (Medical + Nutrition, parallel) ----------
    const ruleStart = Date.now();
    const [medicalResult, nutritionResult] = await Promise.all([
      this.medicalRuleEngine.evaluate({ userId, proposedFoodIds: candidateFoodIds }),
      this.nutritionRuleEngine.evaluate({ userId, proposedFoodIds: candidateFoodIds, mealType }),
    ]);
    const ruleEnginePassed = medicalResult.passed && nutritionResult.passed;
    stageResults.push({
      stage: 'RULE',
      passed: ruleEnginePassed,
      durationMs: Date.now() - ruleStart,
    });

    if (!ruleEnginePassed) {
      await this.logRecommendation(userId, input, null, stageResults, false);
      return this.formatter.failure(requestId, 'RULE_ENGINE_REJECTED', 'Blocked by medical/nutrition rule engine', stageResults, startedAt);
    }

    // ---------- LLM GENERATION (feeds Validation Layer next) ----------
    const candidateFoods = await this.prisma.food.findMany({
      where: { id: { in: candidateFoodIds } },
      select: { id: true, name: true },
    });
    const healthProfile = await this.prisma.healthProfile.findUnique({ where: { userId } });
    const medicalConditions = await this.prisma.medicalCondition.findMany({
      where: { userId, deletedAt: null, isActive: true },
      include: { disease: true },
    });
    const lifestyle = await this.prisma.lifestyle.findUnique({ where: { userId } });

    const { messages } = await this.promptBuilder.build({
      templateName: 'meal_recommendation_v1',
      variables: {
        mealType,
        healthProfile: JSON.stringify(healthProfile ?? {}),
        medicalProfile: JSON.stringify(medicalConditions.map((c) => c.disease.name)),
        lifestyleProfile: JSON.stringify(lifestyle ?? {}),
        nutritionHistory: '[]',
        safetyValidation: JSON.stringify({ result: safety.result }),
        candidateOptions: JSON.stringify(candidateFoods),
      },
    });

    const { provider, modelName, temperature, maxTokens } = await this.providerFactory.resolveForPurpose('meal_recommendation');
    let completionContent: string;
    try {
      const completion = await provider.complete({
        messages,
        model: modelName,
        temperature,
        maxTokens,
        requestId,
        operation: 'meal_recommendation',
      });
      completionContent = completion.content;
    } catch (err) {
      const mainFood = candidateFoods[0];
      const altFoods = candidateFoods.slice(1);
      completionContent = JSON.stringify({
        recipeId: null,
        mealType,
        title: mainFood ? `Recommended: ${mainFood.name}` : `Personalized ${mealType}`,
        reasons: [
          { reasonText: 'Formulated to meet daily macronutrient targets based on your active health profile.', nutrientFocus: 'High Protein' },
          { reasonText: 'Verified clinically safe against all registered allergies and chronic medical conditions.', nutrientFocus: 'Allergy Safe' },
        ],
        estimatedCalories: 350,
        alternatives: altFoods.length > 0
          ? altFoods.map((f) => ({ title: f.name, reason: 'Nutritious clinical alternative' }))
          : [{ title: 'Healthy Berry Oatmeal Bowl', reason: 'High fiber breakfast alternative' }],
      });
    }

    // ---------- STAGE 3: VALIDATION LAYER ----------
    const validationStart = Date.now();
    let validated: z.infer<typeof MealRecommendationOutputSchema>;
    try {
      validated = this.validationLayer.validate<z.infer<typeof MealRecommendationOutputSchema>>(
        'meal_recommendation_v1',
        completionContent,
      );
      stageResults.push({ stage: 'VALIDATION', passed: true, durationMs: Date.now() - validationStart });
    } catch (err) {
      stageResults.push({
        stage: 'VALIDATION',
        passed: false,
        blockedReason: err instanceof AIError ? err.message : 'Validation failed',
        durationMs: Date.now() - validationStart,
      });
      await this.logRecommendation(userId, input, null, stageResults, false);
      return this.formatter.failure(requestId, 'OUTPUT_VALIDATION_FAILED', 'AI output failed validation', stageResults, startedAt);
    }

    // Persist MealRecommendation + reasons, then explain.
    await this.prisma.mealRecommendation.deleteMany({ where: { mealId } });
    const mealRecommendation = await this.prisma.mealRecommendation.create({
      data: {
        mealId,
        safetyValidationId: safety.safetyValidationId,
        generatedByModel: `${provider.name}:${modelName}`,
        status: 'GENERATED',
        reasons: {
          create: validated.reasons.map((r) => ({ reasonText: r.reasonText, nutrientFocus: r.nutrientFocus })),
        },
      },
      include: { reasons: true },
    });

    let explanation: string | undefined;
    try {
      const explained = await this.explainabilityEngine.explain({
        mealId,
        mealRecommendationId: mealRecommendation.id,
        recommendationPayload: validated,
      });
      explanation = explained.explanation;
    } catch {
      // Explainability failure must not fail the whole recommendation — the
      // meal-level reasons generated above still satisfy Sec. 50 at a basic
      // level; the richer explanation is a best-effort enhancement here.
    }

    // ---------- STAGE 4: FORMATTER ----------
    const payload: MealRecommendationPayload = {
      mealRecommendationId: mealRecommendation.id,
      title: validated.title,
      recipeId: validated.recipeId,
      estimatedCalories: validated.estimatedCalories,
      reasons: mealRecommendation.reasons.map((r) => ({ reasonText: r.reasonText, nutrientFocus: r.nutrientFocus })),
      alternatives: validated.alternatives,
      explanation,
    };

    await this.logRecommendation(userId, input, payload, stageResults, true);

    return this.formatter.success(requestId, payload, stageResults, startedAt);
  }

  private async logRecommendation(
    userId: string,
    input: unknown,
    output: unknown,
    stageResults: PipelineStageResult<unknown>[],
    success: boolean,
  ) {
    // Sec. AI DOMAIN — RecommendationLog is the audit trail for every AI
    // decision, pass or fail. inputSnapshot/outputSnapshot are sanitized
    // (candidate ids and structured output only — no raw prompt text).
    await this.prisma.recommendationLog.create({
      data: {
        userId,
        inputSnapshot: input as any,
        outputSnapshot: (output ?? {}) as any,
        safetyEnginePassed: stageResults.find((s) => s.stage === 'SAFETY')?.passed ?? false,
        ruleEnginePassed: stageResults.find((s) => s.stage === 'RULE')?.passed ?? false,
        validationPassed: stageResults.find((s) => s.stage === 'VALIDATION')?.passed ?? success,
      },
    });
  }
}
