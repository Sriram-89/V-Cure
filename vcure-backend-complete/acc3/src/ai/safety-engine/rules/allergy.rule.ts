import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SafetyRule, SafetyRuleContext, SafetyRuleOutcome } from '../safety-engine.types';

/**
 * ALLERGY RULE
 *
 * Sec. 54: "AI must always follow Healthcare Safety Rules" — allergies are
 * the most unambiguous, highest-confidence safety check available, so this
 * rule runs a direct relational join rather than any heuristic matching:
 * User.allergies (active, not soft-deleted) -> AllergyType -> any
 * FoodRestriction row of type ALLERGY referencing that AllergyType AND one
 * of the proposed foods.
 */
@Injectable()
export class AllergyRule implements SafetyRule {
  readonly name = 'AllergyRule';

  constructor(private readonly prisma: PrismaClient) {}

  async evaluate(context: SafetyRuleContext): Promise<SafetyRuleOutcome> {
    const activeAllergies = await this.prisma.allergy.findMany({
      where: { userId: context.userId, deletedAt: null },
      select: { allergyTypeId: true, allergyType: { select: { name: true } } },
    });

    if (activeAllergies.length === 0) {
      return { ruleName: this.name, passed: true, resultCode: 'PASSED' };
    }

    const allergyTypeIds = activeAllergies.map((a) => a.allergyTypeId);

    const conflicting = await this.prisma.foodRestriction.findFirst({
      where: {
        foodId: { in: context.proposedFoodIds },
        type: 'ALLERGY',
        allergyTypeId: { in: allergyTypeIds },
      },
      include: { food: { select: { name: true } } },
    });

    if (conflicting) {
      const allergyName = activeAllergies.find((a) => a.allergyTypeId === conflicting.allergyTypeId)?.allergyType.name;
      return {
        ruleName: this.name,
        passed: false,
        resultCode: 'BLOCKED_ALLERGY',
        reason: `Proposed food "${conflicting.food.name}" conflicts with user's active allergy: ${allergyName ?? 'unknown allergy'}.`,
      };
    }

    return { ruleName: this.name, passed: true, resultCode: 'PASSED' };
  }
}
