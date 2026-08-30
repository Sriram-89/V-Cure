import { PrismaClient } from '@prisma/client';

/**
 * Sec. 49 MASTER TABLES — FoodCategory, DiseaseCategory + safety-critical Diseases,
 * AllergyType, RecipeCategory, ArticleCategory, StoreCategory.
 *
 * Sec. 54 HEALTHCARE SAFETY RULES explicitly names kidney disease, liver disease,
 * and pregnancy as conditions that must never be ignored by the Safety Engine.
 * These are seeded with isCritical=true so the Safety Engine (built in a later
 * step) can hard-block unsafe recommendations by flag rather than by name string.
 */
export async function seedFoodCategories(prisma: PrismaClient) {
  const categories = [
    'Grains & Cereals', 'Vegetables', 'Fruits', 'Legumes & Pulses', 'Dairy',
    'Meat & Poultry', 'Fish & Seafood', 'Nuts & Seeds', 'Oils & Fats',
    'Beverages', 'Spices & Condiments', 'Sweets & Desserts',
  ];
  for (const name of categories) {
    await prisma.foodCategory.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`Seeded ${categories.length} food categories.`);
}

export async function seedDiseasesAndCategories(prisma: PrismaClient) {
  const categoryDefs = [
    {
      name: 'Metabolic Disorders',
      diseases: [
        { name: 'Type 2 Diabetes', isChronic: true, isCritical: false },
        { name: 'Obesity', isChronic: true, isCritical: false },
        { name: 'Thyroid Disorder', isChronic: true, isCritical: false },
      ],
    },
    {
      name: 'Cardiovascular Disorders',
      diseases: [
        { name: 'Hypertension', isChronic: true, isCritical: false },
        { name: 'Coronary Artery Disease', isChronic: true, isCritical: true },
      ],
    },
    {
      name: 'Renal Disorders',
      diseases: [
        // Sec. 54 — "Never ignore kidney disease"
        { name: 'Chronic Kidney Disease', isChronic: true, isCritical: true },
        { name: 'Kidney Stones', isChronic: false, isCritical: true },
      ],
    },
    {
      name: 'Hepatic Disorders',
      diseases: [
        // Sec. 54 — "Never ignore liver disease"
        { name: 'Fatty Liver Disease', isChronic: true, isCritical: true },
        { name: 'Cirrhosis', isChronic: true, isCritical: true },
      ],
    },
    {
      name: 'Reproductive & Maternal Health',
      diseases: [
        // Sec. 54 — "Never ignore pregnancy"
        { name: 'Pregnancy', isChronic: false, isCritical: true },
        { name: 'Gestational Diabetes', isChronic: false, isCritical: true },
        { name: 'PCOS/PCOD', isChronic: true, isCritical: false },
      ],
    },
    {
      name: 'Gastrointestinal Disorders',
      diseases: [
        { name: 'IBS', isChronic: true, isCritical: false },
        { name: 'GERD', isChronic: true, isCritical: false },
        { name: 'Celiac Disease', isChronic: true, isCritical: true },
      ],
    },
  ];

  for (const cat of categoryDefs) {
    const category = await prisma.diseaseCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
    for (const d of cat.diseases) {
      await prisma.disease.upsert({
        where: { name: d.name },
        update: { isChronic: d.isChronic, isCritical: d.isCritical, categoryId: category.id },
        create: { ...d, categoryId: category.id },
      });
    }
  }
  console.log(`Seeded ${categoryDefs.length} disease categories.`);
}

export async function seedAllergyTypes(prisma: PrismaClient) {
  const allergies = [
    'Peanuts', 'Tree Nuts', 'Milk/Lactose', 'Eggs', 'Gluten/Wheat',
    'Soy', 'Shellfish', 'Fish', 'Sesame', 'Sulfites',
  ];
  for (const name of allergies) {
    await prisma.allergyType.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`Seeded ${allergies.length} allergy types.`);
}

export async function seedContentCategories(prisma: PrismaClient) {
  const recipeCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages', 'Desserts'];
  for (const name of recipeCategories) {
    await prisma.recipeCategory.upsert({ where: { name }, update: {}, create: { name } });
  }

  const articleCategories = ['Nutrition Basics', 'Disease Management', 'Lifestyle', 'Mental Wellness', 'Preventive Care'];
  for (const name of articleCategories) {
    await prisma.articleCategory.upsert({ where: { name }, update: {}, create: { name } });
  }

  const storeCategories = ['Grocery', 'Pharmacy', 'Organic Store', 'Supplements'];
  for (const name of storeCategories) {
    await prisma.storeCategory.upsert({ where: { name }, update: {}, create: { name } });
  }

  console.log(
    `Seeded ${recipeCategories.length} recipe categories, ${articleCategories.length} article categories, ${storeCategories.length} store categories.`,
  );
}

export async function seedNutrientCatalogs(prisma: PrismaClient) {
  const vitamins = [
    { name: 'Vitamin A', unit: 'mcg' }, { name: 'Vitamin B12', unit: 'mcg' },
    { name: 'Vitamin C', unit: 'mg' }, { name: 'Vitamin D', unit: 'mcg' },
    { name: 'Vitamin E', unit: 'mg' }, { name: 'Vitamin K', unit: 'mcg' },
  ];
  for (const v of vitamins) {
    await prisma.vitamin.upsert({ where: { name: v.name }, update: {}, create: v });
  }

  const minerals = [
    { name: 'Iron', unit: 'mg' }, { name: 'Calcium', unit: 'mg' },
    { name: 'Zinc', unit: 'mg' }, { name: 'Magnesium', unit: 'mg' },
    { name: 'Potassium', unit: 'mg' }, { name: 'Sodium', unit: 'mg' },
  ];
  for (const m of minerals) {
    await prisma.mineral.upsert({ where: { name: m.name }, update: {}, create: m });
  }

  const macronutrients = [
    { name: 'Protein', unit: 'g' }, { name: 'Carbohydrates', unit: 'g' },
    { name: 'Fat', unit: 'g' }, { name: 'Fiber', unit: 'g' },
  ];
  for (const m of macronutrients) {
    await prisma.macronutrient.upsert({ where: { name: m.name }, update: {}, create: m });
  }

  console.log(`Seeded ${vitamins.length} vitamins, ${minerals.length} minerals, ${macronutrients.length} macronutrients.`);
}
