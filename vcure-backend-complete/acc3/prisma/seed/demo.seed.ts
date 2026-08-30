import { PrismaClient, RoleType } from '@prisma/client';

export const DEMO_USER_ID = '11111111-1111-1111-1111-111111111111';
export const DEMO_FOOD_PEANUT_BUTTER_ID = '22222222-2222-2222-2222-222222222222';
export const DEMO_FOOD_OATMEAL_ID = '33333333-3333-3333-3333-333333333333';
export const DEMO_FOOD_HIGH_SUGAR_ID = '44444444-4444-4444-4444-444444444444';
export const DEMO_FOOD_CHICKEN_SALAD_ID = '55555555-5555-5555-5555-555555555555';
export const DEMO_MEAL_PLAN_ID = '66666666-6666-6666-6666-666666666666';
export const DEMO_MEAL_ID = '77777777-7777-7777-7777-777777777777';

export async function seedDemoData(prisma: PrismaClient) {
  console.log('Seeding Demo User and Clinical Profile data...');

  // 1. Demo Role
  let role = await prisma.role.findFirst({ where: { name: RoleType.USER } });
  if (!role) {
    role = await prisma.role.create({ data: { name: RoleType.USER, description: 'User Role' } });
  }

  // 2. Demo User
  const user = await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: { email: 'demo@vcure.com', emailVerified: true, status: 'ACTIVE' },
    create: {
      id: DEMO_USER_ID,
      firebaseUid: 'demo-firebase-uid-vcure',
      email: 'demo@vcure.com',
      passwordHash: '$2b$10$EpRvmMG5rLS9p/7Zf8Wn/.6N1nJ5M4Wd8.fKzY6Z7H8A9B0C1D2E3',
      phoneNumber: '+15550199',
      status: 'ACTIVE',
      emailVerified: true,
      profile: {
        create: {
          firstName: 'Demo',
          lastName: 'Patient',
          gender: 'MALE',
          dateOfBirth: new Date('1990-01-01'),
        },
      },
      userRoles: {
        create: {
          roleId: role.id,
        },
      },
    },
  });

  // 3. Demo User Health Profile
  await prisma.healthProfile.upsert({
    where: { userId: user.id },
    update: {
      age: 35,
      gender: 'MALE',
      heightCm: 175,
      weightKg: 78,
      activityLevel: 'MODERATELY_ACTIVE',
      primaryGoal: 'WEIGHT_LOSS',
      bmi: 25.4,
      isComplete: true,
    },
    create: {
      userId: user.id,
      age: 35,
      gender: 'MALE',
      heightCm: 175,
      weightKg: 78,
      activityLevel: 'MODERATELY_ACTIVE',
      primaryGoal: 'WEIGHT_LOSS',
      bmi: 25.4,
      isComplete: true,
    },
  });

  // 4. Demo Foods
  const grainCat = await prisma.foodCategory.findFirst({ where: { name: 'Grains & Cereals' } });
  const nutCat = await prisma.foodCategory.findFirst({ where: { name: 'Nuts & Seeds' } });
  const vegCat = await prisma.foodCategory.findFirst({ where: { name: 'Vegetables' } });

  const defaultCatId = grainCat?.id ?? nutCat?.id ?? vegCat!.id;

  await prisma.food.upsert({
    where: { id: DEMO_FOOD_PEANUT_BUTTER_ID },
    update: { name: 'Peanut Butter Toast', isVegetarian: true, isVegan: true, categoryId: nutCat?.id ?? defaultCatId },
    create: {
      id: DEMO_FOOD_PEANUT_BUTTER_ID,
      name: 'Peanut Butter Toast',
      categoryId: nutCat?.id ?? defaultCatId,
      isVegetarian: true,
      isVegan: true,
      nutrition: {
        create: {
          caloriesKcal: 280,
          proteinG: 10,
          carbsG: 24,
          fatG: 16,
          fiberG: 4,
          sugarG: 6,
          sodiumMg: 180,
        },
      },
    },
  });

  await prisma.food.upsert({
    where: { id: DEMO_FOOD_OATMEAL_ID },
    update: { name: 'Healthy Berry Oatmeal Bowl', isVegetarian: true, isVegan: true, categoryId: grainCat?.id ?? defaultCatId },
    create: {
      id: DEMO_FOOD_OATMEAL_ID,
      name: 'Healthy Berry Oatmeal Bowl',
      categoryId: grainCat?.id ?? defaultCatId,
      isVegetarian: true,
      isVegan: true,
      nutrition: {
        create: {
          caloriesKcal: 320,
          proteinG: 12,
          carbsG: 55,
          fatG: 5,
          fiberG: 9,
          sugarG: 8,
          sodiumMg: 45,
        },
      },
    },
  });

  await prisma.food.upsert({
    where: { id: DEMO_FOOD_HIGH_SUGAR_ID },
    update: { name: 'High Sugar Energy Drink', isVegetarian: true, isVegan: true, categoryId: grainCat?.id ?? defaultCatId },
    create: {
      id: DEMO_FOOD_HIGH_SUGAR_ID,
      name: 'High Sugar Energy Drink',
      categoryId: grainCat?.id ?? defaultCatId,
      isVegetarian: true,
      isVegan: true,
      nutrition: {
        create: {
          caloriesKcal: 250,
          proteinG: 0,
          carbsG: 62,
          fatG: 0,
          fiberG: 0,
          sugarG: 58,
          sodiumMg: 120,
        },
      },
    },
  });

  await prisma.food.upsert({
    where: { id: DEMO_FOOD_CHICKEN_SALAD_ID },
    update: { name: 'Mediterranean Grilled Chicken Salad', isVegetarian: false, isVegan: false, categoryId: vegCat?.id ?? defaultCatId },
    create: {
      id: DEMO_FOOD_CHICKEN_SALAD_ID,
      name: 'Mediterranean Grilled Chicken Salad',
      categoryId: vegCat?.id ?? defaultCatId,
      isVegetarian: false,
      isVegan: false,
      nutrition: {
        create: {
          caloriesKcal: 380,
          proteinG: 35,
          carbsG: 14,
          fatG: 18,
          fiberG: 5,
          sugarG: 4,
          sodiumMg: 410,
        },
      },
    },
  });

  // 5. Demo Allergy (Peanut Allergy)
  let peanutAllergyType = await prisma.allergyType.findFirst({ where: { name: { contains: 'Peanut', mode: 'insensitive' } } });
  if (!peanutAllergyType) {
    peanutAllergyType = await prisma.allergyType.create({ data: { name: 'Peanut' } });
  }

  // Link food restriction to Peanut Butter
  await prisma.foodRestriction.upsert({
    where: { id: '80000000-0000-0000-0000-000000000000' },
    update: { foodId: DEMO_FOOD_PEANUT_BUTTER_ID, allergyTypeId: peanutAllergyType.id },
    create: {
      id: '80000000-0000-0000-0000-000000000000',
      foodId: DEMO_FOOD_PEANUT_BUTTER_ID,
      type: 'ALLERGY',
      allergyTypeId: peanutAllergyType.id,
      reason: 'Contains peanut proteins',
    },
  });

  // User Allergy
  await prisma.allergy.upsert({
    where: { id: '88888888-8888-8888-8888-888888888888' },
    update: { userId: user.id, allergyTypeId: peanutAllergyType.id, severity: 'SEVERE' },
    create: {
      id: '88888888-8888-8888-8888-888888888888',
      userId: user.id,
      allergyTypeId: peanutAllergyType.id,
      severity: 'SEVERE',
      reaction: 'Anaphylactic reaction to peanuts',
    },
  });

  // 6. Demo Medical Condition (Type 2 Diabetes)
  let diabetesDisease = await prisma.disease.findFirst({ where: { name: { contains: 'Diabetes', mode: 'insensitive' } } });
  if (!diabetesDisease) {
    const metabCat = await prisma.diseaseCategory.findFirst({ where: { name: 'Metabolic Disorders' } });
    diabetesDisease = await prisma.disease.create({
      data: { name: 'Type 2 Diabetes', categoryId: metabCat!.id, isChronic: true, isCritical: false },
    });
  }

  await prisma.medicalCondition.upsert({
    where: { id: '99999999-9999-9999-9999-999999999999' },
    update: { userId: user.id, diseaseId: diabetesDisease.id, isActive: true },
    create: {
      id: '99999999-9999-9999-9999-999999999999',
      userId: user.id,
      diseaseId: diabetesDisease.id,
      severity: 'MODERATE',
      isActive: true,
      notes: 'Diagnosed 2021',
    },
  });

  // 7. Demo Meal Plan & Meal
  await prisma.mealPlan.upsert({
    where: { id: DEMO_MEAL_PLAN_ID },
    update: { userId: user.id },
    create: {
      id: DEMO_MEAL_PLAN_ID,
      userId: user.id,
      date: new Date(),
    },
  });

  await prisma.meal.upsert({
    where: { id: DEMO_MEAL_ID },
    update: { mealPlanId: DEMO_MEAL_PLAN_ID, mealType: 'BREAKFAST' },
    create: {
      id: DEMO_MEAL_ID,
      mealPlanId: DEMO_MEAL_PLAN_ID,
      mealType: 'BREAKFAST',
      scheduledAt: new Date(),
    },
  });

  console.log('Demo user and clinical data seeded successfully!');
}
