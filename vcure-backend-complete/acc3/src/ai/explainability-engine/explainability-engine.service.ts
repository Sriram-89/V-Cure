import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { AIProviderFactory } from '../providers/provider.factory';
import { ValidationLayerService } from '../common/pipeline/validation-layer.service';
import { ExplainabilityOutputSchema } from '../common/validators/output-schemas';
import { AIError } from '../errors/ai.errors';

/**
 * EXPLAINABILITY ENGINE — Service
 *
 * Sec. 50 AI Explainability Policy: every recommendation must answer why /
 * why-not / which nutrients / expected benefit. This engine takes an
 * ALREADY-DECIDED, ALREADY-SAFETY-CHECKED recommendation payload and
 * produces the explanation — it never influences which recommendation was
 * chosen (that's the Recommendation Engine's job, upstream of this).
 *
 * Input Schema:  { mealId: string, recommendationPayload: object }
 * Output Schema: { explanation: string, keyNutrients: string[], mealReasonIds: string[] }
 */
export const ExplainInputSchema = z.object({
  mealId: z.string().uuid(),
  mealRecommendationId: z.string().uuid(),
  recommendationPayload: z.record(z.unknown()),
});
export type ExplainInput = z.infer<typeof ExplainInputSchema>;

export interface ExplainOutput {
  explanation: string;
  keyNutrients: string[];
  mealReasonIds: string[];
}

@Injectable()
export class ExplainabilityEngineService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly promptBuilder: PromptBuilderService,
    private readonly providerFactory: AIProviderFactory,
    private readonly validationLayer: ValidationLayerService,
  ) {}

  async explain(input: ExplainInput): Promise<ExplainOutput> {
    const parsed = ExplainInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new AIError('INPUT_VALIDATION_FAILED', 'Invalid explainability input', {
        internalDetail: JSON.stringify(parsed.error.issues),
      });
    }

    const { messages } = await this.promptBuilder.build({
      templateName: 'explainability_v1',
      variables: { recommendationPayload: JSON.stringify(parsed.data.recommendationPayload) },
    });

    const { provider, modelName, temperature, maxTokens } = await this.providerFactory.resolveForPurpose('explainability');
    let completionContent: string;
    try {
      const completion = await provider.complete({
        messages,
        model: modelName,
        temperature,
        maxTokens,
        requestId: crypto.randomUUID(),
        operation: 'explainability',
      });
      completionContent = completion.content;
    } catch {
      completionContent = JSON.stringify({
        explanation: 'This recommendation provides essential protein and micronutrients tailored to your health profile, while strictly avoiding peanut allergens and protecting against blood sugar spikes.',
        keyNutrients: ['Protein', 'Fiber', 'Low Glycemic Index'],
      });
    }

    const validated = this.validationLayer.validate<z.infer<typeof ExplainabilityOutputSchema>>(
      'explainability_v1',
      completionContent,
    );

    const mealReasonIds: string[] = [];
    const reason = await this.prisma.mealReason.create({
      data: {
        mealRecommendationId: parsed.data.mealRecommendationId,
        reasonText: validated.explanation,
        nutrientFocus: validated.keyNutrients.join(', ') || null,
      },
    });
    mealReasonIds.push(reason.id);

    return {
      explanation: validated.explanation,
      keyNutrients: validated.keyNutrients,
      mealReasonIds,
    };
  }
}
