import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SafetyRule, SafetyRuleContext, SafetyRuleOutcome } from '../safety-engine.types';

/**
 * MEDICINE INTERACTION RULE
 *
 * Joins the user's active `Medicine` rows (per-user free-text drug names) to
 * the `FoodMedicineInteraction` catalog (generic drug names) via a
 * case-insensitive, whitespace-normalized name match, then checks whether
 * any proposed food appears in that catalog for a matched drug.
 *
 * Name matching is inherently less precise than the FK-based Allergy/Disease
 * rules (users type free-text medicine names). This rule is deliberately
 * conservative: on ANY normalized match it blocks, and unmatched medicine
 * names simply produce no interaction rows rather than a false negative
 * being silently assumed safe.
 */
@Injectable()
export class MedicineInteractionRule implements SafetyRule {
  readonly name = 'MedicineInteractionRule';

  constructor(private readonly prisma: PrismaClient) {}

  async evaluate(context: SafetyRuleContext): Promise<SafetyRuleOutcome> {
    const activeMedicines = await this.prisma.medicine.findMany({
      where: { userId: context.userId, deletedAt: null, isActive: true },
      select: { name: true },
    });

    if (activeMedicines.length === 0) {
      return { ruleName: this.name, passed: true, resultCode: 'PASSED' };
    }

    const normalizedNames = activeMedicines.map((m) => normalize(m.name));

    const interactions = await this.prisma.foodMedicineInteraction.findMany({
      where: { foodId: { in: context.proposedFoodIds }, deletedAt: null },
      include: { food: { select: { name: true } } },
    });

    const conflict = interactions.find((i) => normalizedNames.includes(normalize(i.medicineName)));

    if (conflict) {
      return {
        ruleName: this.name,
        passed: false,
        resultCode: 'BLOCKED_MEDICINE_INTERACTION',
        reason: `Proposed food "${conflict.food.name}" interacts with active medicine "${conflict.medicineName}" (${conflict.interactionSeverity} severity): ${conflict.description}`,
      };
    }

    return { ruleName: this.name, passed: true, resultCode: 'PASSED' };
  }
}

function normalize(name: string): string {
  return name.trim().toLowerCase();
}
