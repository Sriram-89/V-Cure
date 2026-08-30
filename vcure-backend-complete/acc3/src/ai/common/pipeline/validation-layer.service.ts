import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { OUTPUT_SCHEMAS_BY_TEMPLATE_NAME } from '../validators/output-schemas';
import { AIError, ValidationError } from '../../errors/ai.errors';

/**
 * VALIDATION LAYER — Service (stage 3 of the mandatory pipeline)
 *
 * Input Schema:  { templateName: string, rawOutput: string }
 * Output Schema: { data: unknown, templateName: string }
 *
 * "Never return raw LLM output" (AI RULES) means literally never — this is
 * the stage that stands between a provider's raw string and every consumer.
 * It (1) strips code-fence wrapping some models add around JSON, (2) parses
 * JSON, (3) validates shape with the template's zod schema. Any failure
 * throws — callers must NOT catch-and-forward raw text as a fallback, since
 * that would defeat the entire purpose of this stage.
 */
@Injectable()
export class ValidationLayerService {
  validate<T = unknown>(templateName: string, rawOutput: string): T {
    const schema = OUTPUT_SCHEMAS_BY_TEMPLATE_NAME[templateName];
    if (!schema) {
      throw new AIError(
        'OUTPUT_VALIDATION_FAILED',
        `No output schema registered for template "${templateName}" — cannot validate; refusing to pass raw output downstream.`,
      );
    }

    const cleaned = stripCodeFence(rawOutput);

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(cleaned);
    } catch (err) {
      throw new ValidationError('OUTPUT_VALIDATION_FAILED', `Provider output for "${templateName}" was not valid JSON.`);
    }

    const result = schema.safeParse(parsedJson);
    if (!result.success) {
      const fieldErrors = flattenZodErrors(result.error);
      throw new ValidationError(
        'OUTPUT_VALIDATION_FAILED',
        `Provider output for "${templateName}" failed schema validation.`,
        fieldErrors,
      );
    }

    return result.data as T;
  }

  /** For the one free-text template (chat) — enforces non-empty, reasonable-length text instead of a JSON schema. */
  validateText(rawOutput: string, maxLength = 4000): string {
    const trimmed = rawOutput.trim();
    if (trimmed.length === 0) {
      throw new ValidationError('OUTPUT_VALIDATION_FAILED', 'Provider returned empty text output.');
    }
    if (trimmed.length > maxLength) {
      throw new ValidationError('OUTPUT_VALIDATION_FAILED', `Provider output exceeded max length of ${maxLength} characters.`);
    }
    return trimmed;
  }
}

function stripCodeFence(text: string): string {
  const fenced = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : text.trim();
}

function flattenZodErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '(root)';
    out[path] = out[path] ?? [];
    out[path].push(issue.message);
  }
  return out;
}
