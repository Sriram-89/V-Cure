import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { GeminiProvider } from '../providers/gemini.provider';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { AIProviderFactory } from '../providers/provider.factory';
import { ValidationLayerService } from '../common/pipeline/validation-layer.service';
import { OCRExtractionOutputSchema } from '../common/validators/output-schemas';
import { AIError } from '../errors/ai.errors';

/**
 * OCR FOUNDATION — Service
 *
 * Input Schema:  { medicalReportFileId: string, base64Image: string, mimeType: string }
 * Output Schema: { ocrResultId: string, status: OCRStatus, resultsCount: number, requiresManualReview: boolean }
 *
 * Two-step pipeline, matching Sec. AI RESPONSIBILITIES "OCR Pipeline":
 *   1. Vision extraction (Gemini multimodal) -> raw text.
 *   2. Structuring (ocr_extraction_v1 prompt template) -> validated JSON ->
 *      persisted LabResult rows + OCRResult row.
 * Use Case 7 "OCR Failed -> Manual Entry": on ANY failure at either step,
 * this service still creates an `OCRResult` row with status=FAILED (or
 * MANUAL_REVIEW_REQUIRED) rather than throwing past the caller silently —
 * the medical report must always end up in a known, queryable state.
 */
export const RunOCRInputSchema = z.object({
  medicalReportFileId: z.string().uuid(),
  medicalReportId: z.string().uuid(),
  base64Image: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'application/pdf']),
});
export type RunOCRInput = z.infer<typeof RunOCRInputSchema>;

export interface RunOCROutput {
  ocrResultId: string;
  status: 'COMPLETED' | 'FAILED' | 'MANUAL_REVIEW_REQUIRED';
  resultsCount: number;
  requiresManualReview: boolean;
}

const LOW_CONFIDENCE_THRESHOLD = 0.6;

@Injectable()
export class OCRFoundationService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly geminiProvider: GeminiProvider,
    private readonly promptBuilder: PromptBuilderService,
    private readonly providerFactory: AIProviderFactory,
    private readonly validationLayer: ValidationLayerService,
  ) {}

  async run(input: RunOCRInput): Promise<RunOCROutput> {
    const parsed = RunOCRInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new AIError('INPUT_VALIDATION_FAILED', 'Invalid OCR input', {
        internalDetail: JSON.stringify(parsed.error.issues),
      });
    }
    const { medicalReportId, base64Image, mimeType } = parsed.data;

    const ocrResult = await this.prisma.oCRResult.create({
      data: { medicalReportId, status: 'PROCESSING' },
    });

    // ---------- STEP 1: Vision extraction ----------
    let rawText: string;
    try {
      const extraction = await this.geminiProvider.extractText({
        base64Image,
        mimeType,
        requestId: crypto.randomUUID(),
      });
      rawText = extraction.rawText;
    } catch (err) {
      await this.prisma.oCRResult.update({
        where: { id: ocrResult.id },
        data: { status: 'FAILED', errorMessage: 'Vision extraction failed' },
      });
      return { ocrResultId: ocrResult.id, status: 'FAILED', resultsCount: 0, requiresManualReview: true };
    }

    await this.prisma.oCRResult.update({ where: { id: ocrResult.id }, data: { rawExtractedText: rawText } });

    if (rawText.trim().length === 0) {
      await this.prisma.oCRResult.update({
        where: { id: ocrResult.id },
        data: { status: 'MANUAL_REVIEW_REQUIRED', errorMessage: 'No text detected in image' },
      });
      return { ocrResultId: ocrResult.id, status: 'MANUAL_REVIEW_REQUIRED', resultsCount: 0, requiresManualReview: true };
    }

    // ---------- STEP 2: Structuring via prompt template ----------
    try {
      const { messages } = await this.promptBuilder.build({
        templateName: 'ocr_extraction_v1',
        variables: { ocrRawText: rawText },
      });

      const { provider, modelName, temperature, maxTokens } = await this.providerFactory.resolveForPurpose('ocr_extraction');
      const completion = await provider.complete({
        messages,
        model: modelName,
        temperature,
        maxTokens,
        requestId: crypto.randomUUID(),
        operation: 'ocr_extraction',
      });

      const validated = this.validationLayer.validate<z.infer<typeof OCRExtractionOutputSchema>>(
        'ocr_extraction_v1',
        completion.content,
      );

      const requiresManualReview = validated.requiresManualReview || validated.confidenceScore < LOW_CONFIDENCE_THRESHOLD;

      await this.prisma.$transaction([
        this.prisma.oCRResult.update({
          where: { id: ocrResult.id },
          data: {
            status: requiresManualReview ? 'MANUAL_REVIEW_REQUIRED' : 'COMPLETED',
            structuredData: validated as any,
            confidenceScore: validated.confidenceScore,
          },
        }),
        ...validated.results.map((r) =>
          this.prisma.labResult.create({
            data: {
              medicalReportId,
              testName: r.testName,
              value: r.value,
              unit: r.unit,
              referenceRange: r.referenceRange,
              isAbnormal: r.isAbnormal,
            },
          }),
        ),
      ]);

      return {
        ocrResultId: ocrResult.id,
        status: requiresManualReview ? 'MANUAL_REVIEW_REQUIRED' : 'COMPLETED',
        resultsCount: validated.results.length,
        requiresManualReview,
      };
    } catch (err) {
      await this.prisma.oCRResult.update({
        where: { id: ocrResult.id },
        data: { status: 'MANUAL_REVIEW_REQUIRED', errorMessage: 'Structuring/validation step failed' },
      });
      return { ocrResultId: ocrResult.id, status: 'MANUAL_REVIEW_REQUIRED', resultsCount: 0, requiresManualReview: true };
    }
  }
}
