import { ValidationLayerService } from '../common/pipeline/validation-layer.service';
import { ValidationError, AIError } from '../errors/ai.errors';

describe('ValidationLayerService', () => {
  const service = new ValidationLayerService();

  it('parses and validates well-formed JSON against the registered schema', () => {
    const raw = JSON.stringify({
      recipeId: null,
      mealType: 'BREAKFAST',
      title: 'Oatmeal with Berries',
      reasons: [{ reasonText: 'High fiber content supports blood sugar stability.', nutrientFocus: 'Fiber' }],
      estimatedCalories: 320,
      alternatives: [],
    });

    const result = service.validate('meal_recommendation_v1', raw);
    expect(result).toMatchObject({ title: 'Oatmeal with Berries', estimatedCalories: 320 });
  });

  it('strips markdown code fences before parsing', () => {
    const raw = '```json\n' + JSON.stringify({ explanation: 'Because of X', keyNutrients: ['Fiber'] }) + '\n```';
    const result = service.validate('explainability_v1', raw);
    expect(result).toMatchObject({ explanation: 'Because of X' });
  });

  it('throws ValidationError on malformed JSON', () => {
    expect(() => service.validate('explainability_v1', 'not json at all')).toThrow(ValidationError);
  });

  it('throws ValidationError when required fields are missing', () => {
    const raw = JSON.stringify({ explanation: 'ok' }); // missing keyNutrients
    expect(() => service.validate('explainability_v1', raw)).toThrow(ValidationError);
  });

  it('throws AIError for a template name with no registered output schema', () => {
    expect(() => service.validate('unregistered_template_v1', '{}')).toThrow(AIError);
  });

  it('reports field-level errors for debugging', () => {
    try {
      service.validate('explainability_v1', JSON.stringify({ explanation: 123, keyNutrients: 'not-an-array' }));
      fail('expected validate() to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).fieldErrors).toBeDefined();
      expect(Object.keys((err as ValidationError).fieldErrors!).length).toBeGreaterThan(0);
    }
  });

  describe('validateText', () => {
    it('accepts non-empty text within the length limit', () => {
      expect(service.validateText('  Hello there  ')).toBe('Hello there');
    });

    it('rejects empty text', () => {
      expect(() => service.validateText('   ')).toThrow(ValidationError);
    });

    it('rejects text exceeding max length', () => {
      expect(() => service.validateText('a'.repeat(10), 5)).toThrow(ValidationError);
    });
  });
});
