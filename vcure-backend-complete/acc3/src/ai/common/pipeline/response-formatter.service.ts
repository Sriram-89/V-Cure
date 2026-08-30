import { Injectable } from '@nestjs/common';
import { PipelineResult, PipelineTrace, PipelineStageResult } from '../../types/pipeline.types';

/**
 * RESPONSE FORMATTER — Service (stage 4, final stage of the mandatory pipeline)
 *
 * Input Schema:  { requestId, data, stageResults }
 * Output Schema: PipelineResult<T>
 *
 * The Formatter is the ONLY place that produces the object handed back to a
 * controller/job/consumer. It:
 * - Wraps validated data in a consistent envelope.
 * - Attaches a full stage trace (for audit/debugging), but never includes
 *   raw provider output, prompt text, or internal error detail in that trace
 *   (Sec. Security — "Never expose internal AI logic").
 * - Converts any thrown AIError into a safe, formatted failure response
 *   instead of letting it propagate as an unhandled exception past this
 *   layer.
 */
@Injectable()
export class ResponseFormatterService {
  success<T>(requestId: string, data: T, stageResults: PipelineStageResult<unknown>[], startedAt: string): PipelineResult<T> {
    const trace: PipelineTrace = {
      requestId,
      stages: stageResults.map(sanitizeStage),
      startedAt,
      completedAt: new Date().toISOString(),
    };
    return { success: true, data, trace };
  }

  failure<T = never>(
    requestId: string,
    errorCode: string,
    blockedReason: string | undefined,
    stageResults: PipelineStageResult<unknown>[],
    startedAt: string,
  ): PipelineResult<T> {
    const trace: PipelineTrace = {
      requestId,
      stages: stageResults.map(sanitizeStage),
      startedAt,
      completedAt: new Date().toISOString(),
    };
    return { success: false, errorCode, blockedReason, trace };
  }
}

/** Strips any accidental large payloads from stage data before it enters the trace (defense in depth). */
function sanitizeStage(stage: PipelineStageResult<unknown>): PipelineStageResult<unknown> {
  return {
    stage: stage.stage,
    passed: stage.passed,
    blockedReason: stage.blockedReason,
    durationMs: stage.durationMs,
    // Deliberately omit `data` from the trace — full stage output belongs in
    // RecommendationLog (Postgres), not in a payload that might be logged or
    // returned to a client verbatim.
  };
}
