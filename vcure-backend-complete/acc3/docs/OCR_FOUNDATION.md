# OCR Foundation Documentation

## Pipeline

```
Image (base64, from a MedicalReportFile upload)
        │
        ▼
GeminiProvider.extractText()   — real multimodal HTTP call to Gemini's
        │                         generateContent endpoint with inline_data
        │  raw text                image input; temperature=0.0 for maximal
        │                          transcription fidelity (not creativity).
        ▼
PromptBuilderService.build('ocr_extraction_v1', { ocrRawText })
        │  ChatMessage[]
        ▼
AIProviderFactory.resolveForPurpose('ocr_extraction')  — routes to whichever
        │                         provider/model ModelConfiguration names for
        │                         this purpose (seeded default: Gemini
        │                         1.5-flash, temperature 0.1).
        ▼
provider.complete()  — text-only structuring call, separate from the vision
        │               call above (two calls total: one multimodal, one text)
        │  raw JSON text
        ▼
ValidationLayerService.validate('ocr_extraction_v1', ...)
        │  validated { reportDate, results[], confidenceScore, requiresManualReview }
        ▼
Persistence: OCRResult (status/confidenceScore/structuredData) +
             one LabResult row per extracted test
```

## Why two separate provider calls instead of one

Vision-capable structuring in a single call was considered and rejected for
this foundation: separating "read the image" from "structure the text"
means the structuring step's output can be validated against a strict JSON
schema independent of whatever the vision model's exact multimodal response
format looks like, and the raw extracted text is persisted
(`OCRResult.rawExtractedText`) as an audit trail *before* structuring is
attempted — so a structuring failure never loses the underlying transcription.

## Status outcomes

| `OCRResult.status` | When | `requiresManualReview` |
|---|---|---|
| `COMPLETED` | Structuring succeeded, `confidenceScore >= 0.6`, model reported `requiresManualReview: false` | `false` |
| `MANUAL_REVIEW_REQUIRED` | Structuring succeeded but confidence is low, OR the model itself flagged `requiresManualReview: true`, OR vision extraction returned empty text, OR structuring/validation threw | `true` |
| `FAILED` | Vision extraction itself failed (provider error) | `true` |

This directly implements **Use Case 7 "OCR Failed → Manual Entry"**: the
service never throws past its own boundary on a downstream failure — it
always leaves the `OCRResult` row in one of these three known states so the
mobile/web client has something concrete to act on (retry, manual entry
form, or accept as-is).

## Confidence threshold

`LOW_CONFIDENCE_THRESHOLD = 0.6` (see `ocr.service.ts`). This is an
engineering default, not a value specified in any Bible document available
in this conversation — flagged here explicitly so it can be tuned once
`Engineering_Rules.docx` (if it specifies an OCR confidence SLA) is
available, or once real-world OCR accuracy data exists to calibrate against.

## Security notes

- `RunOCRInputSchema` restricts `mimeType` to an explicit enum
  (`image/jpeg`, `image/png`, `application/pdf`) — an unrecognized mime type
  is rejected before any provider call (see
  `src/ai/tests/security.spec.ts` "Invalid OCR Input Handling").
- `base64Image` must be non-empty; an empty payload is rejected the same way.
- The vision prompt explicitly instructs the model to transcribe only, never
  interpret or diagnose — that judgement is deferred entirely to the
  structuring step's schema-validated output and, downstream, to a human
  reviewer for anything flagged `isAbnormal`.
