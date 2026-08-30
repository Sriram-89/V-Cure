import { OCRFoundationService } from '../ocr/ocr.service';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { PromptTemplateService } from '../prompt-templates/prompt-template.service';
import { AIProviderFactory } from '../providers/provider.factory';
import { ValidationLayerService } from '../common/pipeline/validation-layer.service';
import { createMockPrisma, createMockAIProvider, createMockVisionProvider } from './mocks';

describe('OCRFoundationService', () => {
  function buildService(opts: {
    visionText?: string;
    visionThrows?: boolean;
    structuringContent?: string;
  }) {
    const prisma = createMockPrisma();
    const promptBuilder = new PromptBuilderService(new PromptTemplateService(prisma as any));

    const visionProvider = createMockVisionProvider(
      opts.visionThrows
        ? { extractText: jest.fn().mockRejectedValue(new Error('vision provider down')) }
        : { extractText: jest.fn().mockResolvedValue({ rawText: opts.visionText ?? 'Hemoglobin 13.5 g/dL', latencyMs: 5 }) },
    );

    const mockProvider = createMockAIProvider({
      complete: jest.fn().mockResolvedValue({
        content:
          opts.structuringContent ??
          JSON.stringify({
            reportDate: '2026-01-15',
            results: [{ testName: 'Hemoglobin', value: '13.5', unit: 'g/dL', referenceRange: '12-16', isAbnormal: false }],
            confidenceScore: 0.92,
            requiresManualReview: false,
          }),
        finishReason: 'stop',
        latencyMs: 5,
      }),
    });
    const providerFactory = {
      resolveForPurpose: jest.fn().mockResolvedValue({ provider: mockProvider, modelName: 'test-model', temperature: 0, maxTokens: 2048 }),
    } as unknown as AIProviderFactory;

    const service = new OCRFoundationService(prisma as any, visionProvider as any, promptBuilder, providerFactory, new ValidationLayerService());
    return { service, prisma, visionProvider, mockProvider };
  }

  it('completes the full pipeline: vision -> structuring -> validated LabResults', async () => {
    const { service, prisma } = buildService({});

    const result = await service.run({
      medicalReportFileId: '11111111-1111-1111-1111-111111111111',
      medicalReportId: '22222222-2222-2222-2222-222222222222',
      base64Image: 'ZmFrZS1pbWFnZS1ieXRlcw==',
      mimeType: 'image/jpeg',
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.resultsCount).toBe(1);
    expect(result.requiresManualReview).toBe(false);
    expect(prisma.labResult.create).toHaveBeenCalledTimes(1);
  });

  it('marks MANUAL_REVIEW_REQUIRED when confidence is below threshold', async () => {
    const { service } = buildService({
      structuringContent: JSON.stringify({
        reportDate: null,
        results: [],
        confidenceScore: 0.3,
        requiresManualReview: false,
      }),
    });

    const result = await service.run({
      medicalReportFileId: '11111111-1111-1111-1111-111111111111',
      medicalReportId: '22222222-2222-2222-2222-222222222222',
      base64Image: 'ZmFrZQ==',
      mimeType: 'image/jpeg',
    });

    expect(result.status).toBe('MANUAL_REVIEW_REQUIRED');
    expect(result.requiresManualReview).toBe(true);
  });

  it('falls back to FAILED (never throws past the caller) when vision extraction fails — Use Case 7', async () => {
    const { service, prisma } = buildService({ visionThrows: true });

    const result = await service.run({
      medicalReportFileId: '11111111-1111-1111-1111-111111111111',
      medicalReportId: '22222222-2222-2222-2222-222222222222',
      base64Image: 'ZmFrZQ==',
      mimeType: 'image/jpeg',
    });

    expect(result.status).toBe('FAILED');
    expect(result.requiresManualReview).toBe(true);
    expect(prisma.oCRResult.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'FAILED' }) }),
    );
  });

  it('marks MANUAL_REVIEW_REQUIRED when no text is detected in the image', async () => {
    const { service } = buildService({ visionText: '   ' });

    const result = await service.run({
      medicalReportFileId: '11111111-1111-1111-1111-111111111111',
      medicalReportId: '22222222-2222-2222-2222-222222222222',
      base64Image: 'ZmFrZQ==',
      mimeType: 'image/jpeg',
    });

    expect(result.status).toBe('MANUAL_REVIEW_REQUIRED');
  });

  it('handles structuring/validation failure gracefully instead of throwing', async () => {
    const { service } = buildService({ structuringContent: 'not valid json' });

    const result = await service.run({
      medicalReportFileId: '11111111-1111-1111-1111-111111111111',
      medicalReportId: '22222222-2222-2222-2222-222222222222',
      base64Image: 'ZmFrZQ==',
      mimeType: 'image/jpeg',
    });

    expect(result.status).toBe('MANUAL_REVIEW_REQUIRED');
    expect(result.resultsCount).toBe(0);
  });

  it('rejects invalid input at the schema boundary', async () => {
    const { service } = buildService({});
    await expect(
      service.run({ medicalReportFileId: 'bad', medicalReportId: 'bad', base64Image: '', mimeType: 'image/jpeg' } as any),
    ).rejects.toThrow();
  });
});
