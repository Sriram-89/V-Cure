import { PrismaClient, SubscriptionPlanType } from '@prisma/client';

/**
 * Sec. 49 MASTER TABLES — Language, Religion, SubscriptionPlan
 */
export async function seedLanguages(prisma: PrismaClient) {
  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Telugu', code: 'te' },
    { name: 'Tamil', code: 'ta' },
    { name: 'Kannada', code: 'kn' },
    { name: 'Spanish', code: 'es' },
  ];
  for (const l of languages) {
    await prisma.language.upsert({ where: { code: l.code }, update: { name: l.name }, create: l });
  }
  console.log(`Seeded ${languages.length} languages.`);
}

export async function seedReligions(prisma: PrismaClient) {
  const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other', 'Prefer not to say'];
  for (const name of religions) {
    await prisma.religion.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`Seeded ${religions.length} religions.`);
}

export async function seedSubscriptionPlans(prisma: PrismaClient) {
  const plans: {
    type: SubscriptionPlanType;
    name: string;
    priceUsd: number;
    billingPeriod: string;
    features: string[];
  }[] = [
    { type: 'FREE', name: 'V-Cure Free', priceUsd: 0, billingPeriod: 'lifetime', features: ['basic_tracking', 'education_content'] },
    { type: 'PREMIUM_MONTHLY', name: 'V-Cure Premium (Monthly)', priceUsd: 9.99, billingPeriod: 'monthly', features: ['ai_recommendations', 'ocr_reports', 'priority_support'] },
    { type: 'PREMIUM_YEARLY', name: 'V-Cure Premium (Yearly)', priceUsd: 89.99, billingPeriod: 'yearly', features: ['ai_recommendations', 'ocr_reports', 'priority_support', 'annual_discount'] },
    { type: 'FAMILY', name: 'V-Cure Family', priceUsd: 19.99, billingPeriod: 'monthly', features: ['ai_recommendations', 'ocr_reports', 'up_to_5_members'] },
    { type: 'CORPORATE', name: 'V-Cure Corporate Wellness', priceUsd: 0, billingPeriod: 'custom', features: ['bulk_licensing', 'anonymous_analytics'] },
  ];

  for (const p of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { type: p.type },
      update: { name: p.name, priceUsd: p.priceUsd, billingPeriod: p.billingPeriod, features: p.features },
      create: { type: p.type, name: p.name, priceUsd: p.priceUsd, billingPeriod: p.billingPeriod, features: p.features },
    });
  }
  console.log(`Seeded ${plans.length} subscription plans.`);
}
