import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MedicalRule, MedicalRuleContext } from '../medical-rule-engine.types';
import { RuleFinding } from '../../types/pipeline.types';

const RENAL_NAMES = ['Chronic Kidney Disease', 'Kidney Stones'];
const HEPATIC_NAMES = ['Fatty Liver Disease', 'Cirrhosis'];
const PREGNANCY_NAMES = ['Pregnancy', 'Gestational Diabetes'];

/**
 * RENAL RULE
 * Sec. 54: "Never ignore kidney disease." Note that a hard block for a
 * DIRECT FoodRestriction match already happens in MedicalConditionRule
 * (Safety Engine). This rule adds softer, nutrient-threshold guidance for
 * cases with no explicit FoodRestriction row yet (protein/sodium load —
 * common CKD dietary concerns) so the gap between "not explicitly
 * restricted" and "actually fine" doesn't go unflagged.
 */
@Injectable()
export class RenalRule implements MedicalRule {
  readonly name = 'RenalRule';
  private static readonly PROTEIN_WARNING_G = 25;

  constructor(private readonly prisma: PrismaClient) {}

  async evaluate(context: MedicalRuleContext): Promise<RuleFinding[]> {
    const hasRenalCondition = await this.prisma.medicalCondition.findFirst({
      where: { userId: context.userId, deletedAt: null, isActive: true, disease: { name: { in: RENAL_NAMES } } },
    });
    if (!hasRenalCondition) return [];

    const highProteinFoods = await this.prisma.foodNutrition.findMany({
      where: { foodId: { in: context.proposedFoodIds }, proteinG: { gte: RenalRule.PROTEIN_WARNING_G } },
      include: { food: { select: { name: true } } },
    });

    if (highProteinFoods.length === 0) {
      return [{ ruleName: this.name, passed: true, severity: 'INFO', message: 'No high-protein-load items detected for user with a renal condition.' }];
    }

    return highProteinFoods.map((f) => ({
      ruleName: this.name,
      passed: true,
      severity: 'WARNING' as const,
      message: `"${f.food.name}" contains ${f.proteinG}g protein per serving — renal conditions often require monitored protein intake; consult a nephrology dietitian.`,
    }));
  }
}

/**
 * HEPATIC RULE
 * Sec. 54: "Never ignore liver disease." Flags high-fat foods as a common
 * general dietary concern for fatty liver disease / cirrhosis.
 */
@Injectable()
export class HepaticRule implements MedicalRule {
  readonly name = 'HepaticRule';
  private static readonly FAT_WARNING_G = 15;

  constructor(private readonly prisma: PrismaClient) {}

  async evaluate(context: MedicalRuleContext): Promise<RuleFinding[]> {
    const hasHepaticCondition = await this.prisma.medicalCondition.findFirst({
      where: { userId: context.userId, deletedAt: null, isActive: true, disease: { name: { in: HEPATIC_NAMES } } },
    });
    if (!hasHepaticCondition) return [];

    const highFatFoods = await this.prisma.foodNutrition.findMany({
      where: { foodId: { in: context.proposedFoodIds }, fatG: { gte: HepaticRule.FAT_WARNING_G } },
      include: { food: { select: { name: true } } },
    });

    if (highFatFoods.length === 0) {
      return [{ ruleName: this.name, passed: true, severity: 'INFO', message: 'No high-fat items detected for user with a hepatic condition.' }];
    }

    return highFatFoods.map((f) => ({
      ruleName: this.name,
      passed: true,
      severity: 'WARNING' as const,
      message: `"${f.food.name}" contains ${f.fatG}g fat per serving — high-fat intake is a common concern with fatty liver disease/cirrhosis.`,
    }));
  }
}

/**
 * PREGNANCY RULE
 * Sec. 54: "Never ignore pregnancy." This rule's FoodRestriction-based hard
 * block (e.g. raw/unpasteurized items tagged in the catalog) is enforced by
 * MedicalConditionRule; here we add a WARNING-level nutrient-adequacy nudge
 * (folate/iron are commonly under-consumed in pregnancy) rather than a block.
 */
@Injectable()
export class PregnancyRule implements MedicalRule {
  readonly name = 'PregnancyRule';

  constructor(private readonly prisma: PrismaClient) {}

  async evaluate(context: MedicalRuleContext): Promise<RuleFinding[]> {
    const isPregnant = await this.prisma.medicalCondition.findFirst({
      where: { userId: context.userId, deletedAt: null, isActive: true, disease: { name: { in: PREGNANCY_NAMES } } },
    });
    if (!isPregnant) return [];

    // Informational nudge only — always surfaced when pregnancy is active,
    // since folate/iron adequacy is a standing concern regardless of which
    // specific food is being proposed.
    return [
      {
        ruleName: this.name,
        passed: true,
        severity: 'INFO',
        message: 'Active pregnancy detected — prioritize folate- and iron-rich options across the day\'s meals where appropriate.',
      },
    ];
  }
}
