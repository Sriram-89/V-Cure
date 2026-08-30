import { ResponseFormatterService } from '../common/pipeline/response-formatter.service';
import { PipelineStageResult } from '../types/pipeline.types';

describe('ResponseFormatterService', () => {
  const formatter = new ResponseFormatterService();

  const stages: PipelineStageResult<unknown>[] = [
    { stage: 'SAFETY', passed: true, durationMs: 5, data: { secretInternal: 'should not leak' } },
    { stage: 'RULE', passed: true, durationMs: 3 },
  ];

  it('wraps successful data in a PipelineResult envelope with success=true', () => {
    const result = formatter.success('req-1', { title: 'Meal' }, stages, new Date().toISOString());
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ title: 'Meal' });
    expect(result.trace.requestId).toBe('req-1');
    expect(result.trace.completedAt).toBeDefined();
  });

  it('never leaks stage.data into the trace (defense in depth against internal-logic exposure)', () => {
    const result = formatter.success('req-1', { title: 'Meal' }, stages, new Date().toISOString());
    for (const s of result.trace.stages) {
      expect((s as any).data).toBeUndefined();
    }
  });

  it('wraps failures with success=false, an errorCode, and no data field', () => {
    const result = formatter.failure('req-2', 'SAFETY_BLOCKED', 'allergy conflict', stages, new Date().toISOString());
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('SAFETY_BLOCKED');
    expect(result.blockedReason).toBe('allergy conflict');
    expect(result.data).toBeUndefined();
  });

  it('preserves stage order and pass/fail flags in the trace', () => {
    const result = formatter.success('req-3', {}, stages, new Date().toISOString());
    expect(result.trace.stages.map((s) => s.stage)).toEqual(['SAFETY', 'RULE']);
    expect(result.trace.stages.every((s) => s.passed)).toBe(true);
  });
});
