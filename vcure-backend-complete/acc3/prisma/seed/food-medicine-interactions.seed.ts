import { PrismaClient } from '@prisma/client';

/**
 * Sec. 49-style master data for the additive FoodMedicineInteraction catalog
 * (see schema.prisma comment + migration 000000000001). Starter set of
 * well-established, commonly-cited food-drug interactions. Extend via
 * admin tooling as the Medical team reviews additional pairs.
 *
 * NOTE: matches against Medicine.name are case-insensitive/whitespace-normalized
 * (see MedicineInteractionRule) — medicineName here should be the common
 * generic name a user is likely to type.
 */
export async function seedFoodMedicineInteractions(prisma: PrismaClient) {
  const pairs: { foodName: string; medicineName: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; description: string }[] = [
    {
      foodName: 'Grapefruit',
      medicineName: 'Statins',
      severity: 'HIGH',
      description: 'Grapefruit can significantly increase blood levels of many statins, raising the risk of side effects.',
    },
    {
      foodName: 'Spinach',
      medicineName: 'Warfarin',
      severity: 'MEDIUM',
      description: 'High vitamin K content in spinach can reduce the effectiveness of warfarin; intake should stay consistent.',
    },
    {
      foodName: 'Kale',
      medicineName: 'Warfarin',
      severity: 'MEDIUM',
      description: 'High vitamin K content in kale can reduce the effectiveness of warfarin; intake should stay consistent.',
    },
    {
      foodName: 'Banana',
      medicineName: 'ACE Inhibitors',
      severity: 'MEDIUM',
      description: 'High-potassium foods like bananas combined with ACE inhibitors can raise blood potassium to unsafe levels.',
    },
    {
      foodName: 'Milk',
      medicineName: 'Tetracycline',
      severity: 'LOW',
      description: 'Calcium in dairy can bind tetracycline-class antibiotics and reduce absorption.',
    },
  ];

  for (const p of pairs) {
    const food = await prisma.food.findFirst({ where: { name: p.foodName } });
    if (!food) continue; // Skip silently if the base food catalog doesn't have this item yet.

    const existing = await prisma.foodMedicineInteraction.findFirst({
      where: { foodId: food.id, medicineName: p.medicineName },
    });
    if (!existing) {
      await prisma.foodMedicineInteraction.create({
        data: {
          foodId: food.id,
          medicineName: p.medicineName,
          interactionSeverity: p.severity,
          description: p.description,
        },
      });
    }
  }
  console.log(`Seeded food-medicine interaction catalog (${pairs.length} candidate pairs; some may be skipped if the food isn't seeded).`);
}
