import { AllergyRule } from '../safety-engine/rules/allergy.rule';
import { MedicalConditionRule } from '../safety-engine/rules/medical-condition.rule';
import { MedicineInteractionRule } from '../safety-engine/rules/medicine-interaction.rule';
import { SafetyEngineService } from '../safety-engine/safety-engine.service';
import { createMockPrisma } from './mocks';

describe('AllergyRule', () => {
  it('passes when the user has no active allergies', async () => {
    const prisma = createMockPrisma();
    const rule = new AllergyRule(prisma as any);
    const result = await rule.evaluate({ userId: 'u1', proposedFoodIds: ['f1'] });
    expect(result.passed).toBe(true);
    expect(result.resultCode).toBe('PASSED');
  });

  it('blocks when a proposed food conflicts with an active allergy', async () => {
    const prisma = createMockPrisma();
    prisma.allergy.findMany.mockResolvedValue([{ allergyTypeId: 'peanut-id', allergyType: { name: 'Peanuts' } }]);
    prisma.foodRestriction.findFirst.mockResolvedValue({
      allergyTypeId: 'peanut-id',
      food: { name: 'Peanut Butter' },
    });

    const rule = new AllergyRule(prisma as any);
    const result = await rule.evaluate({ userId: 'u1', proposedFoodIds: ['peanut-butter-id'] });

    expect(result.passed).toBe(false);
    expect(result.resultCode).toBe('BLOCKED_ALLERGY');
    expect(result.reason).toContain('Peanut Butter');
    expect(result.reason).toContain('Peanuts');
  });
});

describe('MedicalConditionRule', () => {
  it('passes when the user has no active medical conditions', async () => {
    const prisma = createMockPrisma();
    const rule = new MedicalConditionRule(prisma as any);
    const result = await rule.evaluate({ userId: 'u1', proposedFoodIds: ['f1'] });
    expect(result.passed).toBe(true);
  });

  it('blocks and tags CRITICAL for a critical condition like Chronic Kidney Disease', async () => {
    const prisma = createMockPrisma();
    prisma.medicalCondition.findMany.mockResolvedValue([
      { diseaseId: 'ckd-id', disease: { name: 'Chronic Kidney Disease', isCritical: true } },
    ]);
    prisma.foodRestriction.findFirst.mockResolvedValue({ diseaseId: 'ckd-id', food: { name: 'Salted Nuts' } });

    const rule = new MedicalConditionRule(prisma as any);
    const result = await rule.evaluate({ userId: 'u1', proposedFoodIds: ['salted-nuts-id'] });

    expect(result.passed).toBe(false);
    expect(result.resultCode).toBe('BLOCKED_MEDICAL_CONDITION');
    expect(result.reason).toContain('CRITICAL CONDITION');
  });
});

describe('MedicineInteractionRule', () => {
  it('passes when the user has no active medicines', async () => {
    const prisma = createMockPrisma();
    const rule = new MedicineInteractionRule(prisma as any);
    const result = await rule.evaluate({ userId: 'u1', proposedFoodIds: ['f1'] });
    expect(result.passed).toBe(true);
  });

  it('blocks on a case-insensitive medicine name match', async () => {
    const prisma = createMockPrisma();
    prisma.medicine.findMany.mockResolvedValue([{ name: '  warfarin  ' }]);
    prisma.foodMedicineInteraction.findMany.mockResolvedValue([
      {
        medicineName: 'Warfarin',
        interactionSeverity: 'MEDIUM',
        description: 'Vitamin K interferes with anticoagulation.',
        food: { name: 'Spinach' },
      },
    ]);

    const rule = new MedicineInteractionRule(prisma as any);
    const result = await rule.evaluate({ userId: 'u1', proposedFoodIds: ['spinach-id'] });

    expect(result.passed).toBe(false);
    expect(result.resultCode).toBe('BLOCKED_MEDICINE_INTERACTION');
    expect(result.reason).toContain('Spinach');
  });
});

describe('SafetyEngineService', () => {
  it('returns PASSED and persists a SafetyValidation row when all rules pass', async () => {
    const prisma = createMockPrisma();
    const service = new SafetyEngineService(
      prisma as any,
      new AllergyRule(prisma as any),
      new MedicalConditionRule(prisma as any),
      new MedicineInteractionRule(prisma as any),
    );

    const result = await service.check({ userId: 'u1', proposedFoodIds: ['f1'] });

    expect(result.result).toBe('PASSED');
    expect(prisma.safetyValidation.create).toHaveBeenCalledTimes(1);
    expect(result.ruleOutcomes).toHaveLength(3);
  });

  it('aggregates a blocked reason from whichever rule(s) failed, without short-circuiting the others', async () => {
    const prisma = createMockPrisma();
    prisma.allergy.findMany.mockResolvedValue([{ allergyTypeId: 'a1', allergyType: { name: 'Shellfish' } }]);
    prisma.foodRestriction.findFirst.mockResolvedValue({ allergyTypeId: 'a1', food: { name: 'Shrimp' } });

    const service = new SafetyEngineService(
      prisma as any,
      new AllergyRule(prisma as any),
      new MedicalConditionRule(prisma as any),
      new MedicineInteractionRule(prisma as any),
    );

    const result = await service.check({ userId: 'u1', proposedFoodIds: ['shrimp-id'] });

    expect(result.result).toBe('BLOCKED_ALLERGY');
    expect(result.ruleOutcomes).toHaveLength(3); // all 3 rules still ran
    expect(prisma.safetyValidation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ result: 'BLOCKED_ALLERGY' }) }),
    );
  });

  it('checkOrThrow throws SafetyBlockedError when not PASSED', async () => {
    const prisma = createMockPrisma();
    prisma.allergy.findMany.mockResolvedValue([{ allergyTypeId: 'a1', allergyType: { name: 'Gluten' } }]);
    prisma.foodRestriction.findFirst.mockResolvedValue({ allergyTypeId: 'a1', food: { name: 'Bread' } });

    const service = new SafetyEngineService(
      prisma as any,
      new AllergyRule(prisma as any),
      new MedicalConditionRule(prisma as any),
      new MedicineInteractionRule(prisma as any),
    );

    await expect(service.checkOrThrow({ userId: 'u1', proposedFoodIds: ['bread-id'] })).rejects.toThrow();
  });

  it('rejects invalid input at the schema boundary', async () => {
    const prisma = createMockPrisma();
    const service = new SafetyEngineService(
      prisma as any,
      new AllergyRule(prisma as any),
      new MedicalConditionRule(prisma as any),
      new MedicineInteractionRule(prisma as any),
    );

    await expect(service.check({ userId: 'not-a-uuid', proposedFoodIds: [] } as any)).rejects.toThrow();
  });
});
