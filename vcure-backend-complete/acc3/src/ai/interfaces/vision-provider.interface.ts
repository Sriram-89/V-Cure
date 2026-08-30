/**
 * OCR FOUNDATION — Vision Provider Contract
 *
 * Sec. AI TECH STACK lists "OCR Engine" alongside OpenAI-compatible APIs and
 * Gemini rather than a separate dedicated OCR vendor. Both configured
 * providers support multimodal (image) input in their real APIs, so OCR
 * text extraction is implemented as a vision capability on the SAME
 * provider classes used for chat/embedding — no third SDK/vendor
 * integration is introduced, keeping the provider surface minimal per
 * "extend, never redesign".
 */
export interface OCRImageInput {
  /** Base64-encoded image bytes (no data: URL prefix). */
  base64Image: string;
  mimeType: 'image/jpeg' | 'image/png' | 'application/pdf';
  requestId: string;
}

export interface OCRTextResult {
  rawText: string;
  latencyMs: number;
}

export interface VisionProvider {
  extractText(input: OCRImageInput): Promise<OCRTextResult>;
}
