/**
 * OCR END-TO-END TEST
 *
 * Traces the full chain named in the Phase 2 requirements:
 *   Image -> Gemini Vision -> OCR Extraction -> Validation -> Persistence
 *
 * "Gemini Vision" here is the real `GeminiProvider.extractText()` code path
 * (exercised directly, with only the outbound `fetch` mocked — no live
 * network in this sandbox), not a hand-rolled test double of a different
 * shape. This is what distinguishes this file from ocr-foundation.spec.ts,
 * which mocks the VisionProvider interface at the OCRFoundationService
 * boundary; this file goes one layer deeper into GeminiProvider itself.
 */
import { GeminiProvider } from '../providers/gemini.provider';
import { OCRFoundationService } from '../ocr/ocr.service';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { PromptTemplateService } from '../prompt-templates/prompt-template.service';
import { AIProviderFactory } from '../providers/provider.factory';
import { ValidationLayerService } from '../common/pipeline/validation-layer.service';
import { createMockPrisma, createMockAIProvider, createMockAIEnv } from './mocks';

const REPORT_ID = '22222222-2222-2222-2222-222222222222';
const FILE_ID = '11111111-1111-1111-1111-111111111111';

describe('OCR End-to-End: Image -> Gemini Vision -> Extraction -> Validation -> Persistence', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('runs the real GeminiProvider.extractText() HTTP call path (mocked at the fetch boundary only)', async () => {
    const env = createMockAIEnv();
    const geminiProvider = new GeminiProvider(env, 'https://fake-gemini.test/v1beta');

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'Hemoglobin: 13.5 g/dL\nWBC: 7200 /uL' }] } }],
      }),
    }) as any;

    const prisma = createMockPrisma();
    prisma.oCRResult.create.mockResolvedValue({ id: 'ocr-e2e-1', medicalReportId: REPORT_ID, status: 'PROCESSING' });

    const promptBuilder = new PromptBuilderService(new PromptTemplateService(prisma as any));
    const structuringProvider = createMockAIProvider({
      complete: jest.fn().mockResolvedValue({
        content: JSON.stringify({
          reportDate: '2026-02-01',
          results: [
            { testName: 'Hemoglobin', value: '13.5', unit: 'g/dL', referenceRange: '12-16', isAbnormal: false },
            { testName: 'WBC', value: '7200', unit: '/uL', referenceRange: '4000-11000', isAbnormal: false },
          ],
          confidenceScore: 0.95,
          requiresManualReview: false,
        }),
        finishReason: 'stop',
        latencyMs: 8,
      }),
    });
    const providerFactory = {
      resolveForPurpose: jest.fn().mockResolvedValue({ provider: structuringProvider, modelName: 'gemini-1.5-flash', temperature: 0.1, maxTokens: 2048 }),
    } as unknown as AIProviderFactory;

    const ocrService = new OCRFoundationService(prisma as any, geminiProvider, promptBuilder, providerFactory, new ValidationLayerService());

    const result = await ocrService.run({
      medicalReportFileId: FILE_ID,
      medicalReportId: REPORT_ID,
      base64Image: 'ZmFrZS1pbWFnZS1ieXRlcw==',
      mimeType: 'image/jpeg',
    });

    // Step 1 verification: Gemini Vision was actually invoked over HTTP.
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('generateContent'),
      expect.objectContaining({ method: 'POST' }),
    );
    // Step 2+3 verification: extraction -> structuring -> validation succeeded.
    expect(result.status).toBe('COMPLETED');
    expect(result.resultsCount).toBe(2);
    // Step 4 verification: persistence happened for both lab results and the OCRResult row.
    expect(prisma.labResult.create).toHaveBeenCalledTimes(2);
    expect(prisma.oCRResult.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ rawExtractedText: expect.stringContaining('Hemoglobin') }) }),
    );
  });

  it('propagates a Gemini HTTP failure into a FAILED OCRResult, never an unhandled rejection', async () => {
    const env = createMockAIEnv();
    const geminiProvider = new GeminiProvider(env, 'https://fake-gemini.test/v1beta');

    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as any;

    const prisma = createMockPrisma();
    prisma.oCRResult.create.mockResolvedValue({ id: 'ocr-e2e-2', medicalReportId: REPORT_ID, status: 'PROCESSING' });
    const promptBuilder = new PromptBuilderService(new PromptTemplateService(prisma as any));
    const providerFactory = { resolveForPurpose: jest.fn() } as unknown as AIProviderFactory;

    const ocrService = new OCRFoundationService(prisma as any, geminiProvider, promptBuilder, providerFactory, new ValidationLayerService());

    const result = await ocrService.run({
      medicalReportFileId: FILE_ID,
      medicalReportId: REPORT_ID,
      base64Image: 'ZmFrZQ==',
      mimeType: 'image/jpeg',
    });

    expect(result.status).toBe('FAILED');
    expect(result.requiresManualReview).toBe(true);
  }, 15_000);
});
