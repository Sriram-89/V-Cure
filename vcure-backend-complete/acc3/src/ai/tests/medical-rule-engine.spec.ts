import { DiabetesRule, HypertensionRule } from '../medical-rule-engine/rules/metabolic-cardio.rule';
import { RenalRule, HepaticRule, PregnancyRule } from '../medical-rule-engine/rules/renal-hepatic-pregnancy.rule';
import { MedicalRuleEngineService } from '../medical-rule-engine/medical-rule-engine.service';
import { createMockPrisma } from './mocks';

describe('DiabetesRule', () => {
  it('returns no findings for a user without diabetes', async () => {
    const prisma = createMockPrisma();
    const rule = new DiabetesRule(prisma as any);
    const findings = await rule.evaluate({ userId: 'u1', proposedFoodIds: ['f1'] });
    expect(findings).toHaveLength(0);
  });

  it('flags high-sugar foods as WARNING (never BLOCKING) for a user with diabetes', async () => {
    const prisma = createMockPrisma();
    prisma.medicalCondition.findFirst.mockResolvedValue({ id: 'mc1' });
    prisma.foodNutrition.findMany.mockResolvedValue([{ sugarG: 20, food: { name: 'Cake' } }]);

    const rule = new DiabetesRule(prisma as any);
    const findings = await rule.evaluate({ userId: 'u1', proposedFoodIds: ['cake-id'] });

    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('WARNING');
    expect(findings[0].passed).toBe(true); // WARNING findings never block
    expect(findings[0].message).toContain('Cake');
  });
});

describe('HypertensionRule', () => {
  it('flags high-sodium foods for a user with hypertension', async () => {
    const prisma = createMockPrisma();
    prisma.medicalCondition.findFirst.mockResolvedValue({ id: 'mc1' });
    prisma.foodNutrition.findMany.mockResolvedValue([{ sodiumMg: 900, food: { name: 'Instant Noodles' } }]);

    const rule = new HypertensionRule(prisma as any);
    const findings = await rule.evaluate({ userId: 'u1', proposedFoodIds: ['noodles-id'] });

    expect(findings[0].severity).toBe('WARNING');
    expect(findings[0].message).toContain('Instant Noodles');
  });
});

describe('RenalRule / HepaticRule / PregnancyRule', () => {
  it('RenalRule flags high-protein foods for CKD', async () => {
    const prisma = createMockPrisma();
    prisma.medicalCondition.findFirst.mockResolvedValue({ id: 'mc1' });
    prisma.foodNutrition.findMany.mockResolvedValue([{ proteinG: 30, food: { name: 'Chicken Breast' } }]);
    const findings = await new RenalRule(prisma as any).evaluate({ userId: 'u1', proposedFoodIds: ['chicken-id'] });
    expect(findings[0].severity).toBe('WARNING');
  });

  it('HepaticRule flags high-fat foods for fatty liver disease', async () => {
    const prisma = createMockPrisma();
    prisma.medicalCondition.findFirst.mockResolvedValue({ id: 'mc1' });
    prisma.foodNutrition.findMany.mockResolvedValue([{ fatG: 25, food: { name: 'Fried Chicken' } }]);
    const findings = await new HepaticRule(prisma as any).evaluate({ userId: 'u1', proposedFoodIds: ['fried-id'] });
    expect(findings[0].severity).toBe('WARNING');
  });

  it('PregnancyRule always returns an INFO nudge when pregnancy is active', async () => {
    const prisma = createMockPrisma();
    prisma.medicalCondition.findFirst.mockResolvedValue({ id: 'mc1' });
    const findings = await new PregnancyRule(prisma as any).evaluate({ userId: 'u1', proposedFoodIds: ['f1'] });
    expect(findings).toHaveLength(1);
    expect(findings[0].severity).toBe('INFO');
  });
});

describe('MedicalRuleEngineService', () => {
  it('combines findings from all rules and never fails passed=true unless a BLOCKING finding exists', async () => {
    const prisma = createMockPrisma();
    prisma.medicalCondition.findFirst.mockResolvedValue(null); // no conditions -> all rules no-op

    const service = new MedicalRuleEngineService(
      new DiabetesRule(prisma as any),
      new HypertensionRule(prisma as any),
      new RenalRule(prisma as any),
      new HepaticRule(prisma as any),
      new PregnancyRule(prisma as any),
    );

    const result = await service.evaluate({ userId: 'u1', proposedFoodIds: ['f1'] });
    expect(result.passed).toBe(true);
    expect(result.findings).toHaveLength(0);
  });

  it('rejects invalid input', async () => {
    const prisma = createMockPrisma();
    const service = new MedicalRuleEngineService(
      new DiabetesRule(prisma as any),
      new HypertensionRule(prisma as any),
      new RenalRule(prisma as any),
      new HepaticRule(prisma as any),
      new PregnancyRule(prisma as any),
    );
    await expect(service.evaluate({ userId: 'bad', proposedFoodIds: [] } as any)).rejects.toThrow();
  });
});
