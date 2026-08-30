import type { MealDetail, MealSummary } from "@/types/meals";

export const MOCK_MEALS: MealDetail[] = [
  {
    id: "meal-oats-berries",
    name: "Oats & Mixed Berries",
    slot: "BREAKFAST",
    imageQuery: "oatmeal bowl mixed berries",
    calories: 320,
    safetyStatus: "SAFE",
    safetyNote: null,
    isFavorite: false,
    dietTags: ["Vegetarian", "High Fiber"],
    nutrition: {
      calories: 320,
      macros: { proteinG: 11, carbsG: 54, fatG: 7 },
      micronutrients: [
        { name: "Iron", amount: "2.1mg", percentOfDailyValue: 12 },
        { name: "Vitamin C", amount: "14mg", percentOfDailyValue: 16 },
        { name: "Calcium", amount: "90mg", percentOfDailyValue: 9 }
      ]
    },
    portion: { amount: 1, unit: "bowl", description: "1 bowl (approx. 300g)" },
    aiExplanation:
      "High in fiber and low glycemic impact, this keeps morning blood sugar steady and fits your activity level without conflicting with any logged condition.",
    ingredients: ["Rolled oats", "Blueberries", "Strawberries", "Almond milk", "Honey"],
    alternativeMealIds: ["meal-greek-yogurt-granola", "meal-veggie-omelette"]
  },
  {
    id: "meal-greek-yogurt-granola",
    name: "Greek Yogurt & Granola",
    slot: "BREAKFAST",
    imageQuery: "greek yogurt granola bowl",
    calories: 290,
    safetyStatus: "SAFE",
    safetyNote: null,
    isFavorite: true,
    dietTags: ["Vegetarian", "High Protein"],
    nutrition: {
      calories: 290,
      macros: { proteinG: 18, carbsG: 34, fatG: 8 },
      micronutrients: [
        { name: "Calcium", amount: "220mg", percentOfDailyValue: 22 },
        { name: "Vitamin B12", amount: "0.9µg", percentOfDailyValue: 15 }
      ]
    },
    portion: { amount: 1, unit: "cup", description: "1 cup yogurt + 1/4 cup granola" },
    aiExplanation:
      "Protein-forward start that supports your fitness goal and keeps you full until lunch.",
    ingredients: ["Greek yogurt", "Granola", "Honey"],
    alternativeMealIds: ["meal-oats-berries"]
  },
  {
    id: "meal-veggie-omelette",
    name: "Vegetable Omelette",
    slot: "BREAKFAST",
    imageQuery: "vegetable omelette plate",
    calories: 260,
    safetyStatus: "SAFE",
    safetyNote: null,
    isFavorite: false,
    dietTags: ["High Protein", "Low Carb"],
    nutrition: {
      calories: 260,
      macros: { proteinG: 19, carbsG: 6, fatG: 18 },
      micronutrients: [
        { name: "Vitamin A", amount: "310µg", percentOfDailyValue: 34 },
        { name: "Folate", amount: "40µg", percentOfDailyValue: 10 }
      ]
    },
    portion: { amount: 2, unit: "eggs", description: "2 eggs with mixed vegetables" },
    aiExplanation:
      "Low-carb and high-protein — a good fit given your activity level and current goal.",
    ingredients: ["Eggs", "Bell peppers", "Onion", "Spinach"],
    alternativeMealIds: ["meal-greek-yogurt-granola"]
  },
  {
    id: "meal-grilled-paneer-bowl",
    name: "Grilled Paneer Bowl",
    slot: "LUNCH",
    imageQuery: "grilled paneer bowl salad",
    calories: 480,
    safetyStatus: "SAFE",
    safetyNote: null,
    isFavorite: false,
    dietTags: ["Vegetarian", "High Protein"],
    nutrition: {
      calories: 480,
      macros: { proteinG: 24, carbsG: 42, fatG: 22 },
      micronutrients: [
        { name: "Calcium", amount: "310mg", percentOfDailyValue: 31 },
        { name: "Iron", amount: "3.4mg", percentOfDailyValue: 19 }
      ]
    },
    portion: { amount: 1, unit: "bowl", description: "1 large bowl (approx. 400g)" },
    aiExplanation:
      "Balanced macro mix that lines up with your moderate activity level and vegetarian preference.",
    ingredients: ["Paneer", "Brown rice", "Bell peppers", "Mixed greens"],
    alternativeMealIds: ["meal-quinoa-chickpea-salad"]
  },
  {
    id: "meal-quinoa-chickpea-salad",
    name: "Quinoa & Chickpea Salad",
    slot: "LUNCH",
    imageQuery: "quinoa chickpea salad bowl",
    calories: 420,
    safetyStatus: "SAFE",
    safetyNote: null,
    isFavorite: true,
    dietTags: ["Vegan", "High Fiber"],
    nutrition: {
      calories: 420,
      macros: { proteinG: 16, carbsG: 58, fatG: 12 },
      micronutrients: [
        { name: "Folate", amount: "180µg", percentOfDailyValue: 45 },
        { name: "Magnesium", amount: "90mg", percentOfDailyValue: 21 }
      ]
    },
    portion: { amount: 1, unit: "bowl", description: "1 bowl (approx. 350g)" },
    aiExplanation:
      "Plant-based and fiber-rich, supporting steady digestion alongside your current goal.",
    ingredients: ["Quinoa", "Chickpeas", "Cucumber", "Tomato", "Lemon dressing"],
    alternativeMealIds: ["meal-grilled-paneer-bowl"]
  },
  {
    id: "meal-grilled-chicken-veggies",
    name: "Grilled Chicken & Roast Veggies",
    slot: "DINNER",
    imageQuery: "grilled chicken roasted vegetables plate",
    calories: 510,
    safetyStatus: "SAFE",
    safetyNote: null,
    isFavorite: false,
    dietTags: ["High Protein", "Low Carb"],
    nutrition: {
      calories: 510,
      macros: { proteinG: 42, carbsG: 28, fatG: 20 },
      micronutrients: [
        { name: "Vitamin B6", amount: "1.1mg", percentOfDailyValue: 65 },
        { name: "Potassium", amount: "820mg", percentOfDailyValue: 17 }
      ]
    },
    portion: { amount: 1, unit: "plate", description: "150g chicken + roasted vegetables" },
    aiExplanation:
      "High protein to support recovery, with roasted vegetables keeping the meal within your calorie range for dinner.",
    ingredients: ["Chicken breast", "Zucchini", "Carrots", "Olive oil"],
    alternativeMealIds: ["meal-lentil-soup"]
  },
  {
    id: "meal-lentil-soup",
    name: "Lentil Soup & Whole Wheat Roti",
    slot: "DINNER",
    imageQuery: "lentil soup bowl with bread",
    calories: 400,
    safetyStatus: "SAFE",
    safetyNote: null,
    isFavorite: false,
    dietTags: ["Vegetarian", "High Fiber"],
    nutrition: {
      calories: 400,
      macros: { proteinG: 18, carbsG: 60, fatG: 8 },
      micronutrients: [
        { name: "Iron", amount: "3.9mg", percentOfDailyValue: 22 },
        { name: "Folate", amount: "230µg", percentOfDailyValue: 58 }
      ]
    },
    portion: { amount: 1, unit: "bowl", description: "1 bowl soup + 1 roti" },
    aiExplanation: "Light, warming, and easy to digest for an evening meal.",
    ingredients: ["Red lentils", "Whole wheat roti", "Cumin", "Turmeric"],
    alternativeMealIds: ["meal-grilled-chicken-veggies"]
  },
  {
    id: "meal-salted-peanuts",
    name: "Salted Peanuts",
    slot: "SNACK",
    imageQuery: "bowl of salted peanuts",
    calories: 170,
    safetyStatus: "FLAGGED",
    safetyNote: "Allergy match",
    isFavorite: false,
    dietTags: ["Vegan"],
    nutrition: {
      calories: 170,
      macros: { proteinG: 7, carbsG: 5, fatG: 14 },
      micronutrients: [{ name: "Niacin", amount: "3.8mg", percentOfDailyValue: 24 }]
    },
    portion: { amount: 30, unit: "g", description: "Small handful (30g)" },
    aiExplanation:
      "Flagged because peanuts match an allergy on your medical profile — consider one of the alternatives instead.",
    ingredients: ["Peanuts", "Salt"],
    alternativeMealIds: ["meal-roasted-chickpeas"]
  },
  {
    id: "meal-roasted-chickpeas",
    name: "Roasted Chickpeas",
    slot: "SNACK",
    imageQuery: "roasted chickpeas snack bowl",
    calories: 140,
    safetyStatus: "SAFE",
    safetyNote: null,
    isFavorite: false,
    dietTags: ["Vegan", "High Fiber"],
    nutrition: {
      calories: 140,
      macros: { proteinG: 6, carbsG: 20, fatG: 3 },
      micronutrients: [{ name: "Fiber", amount: "5g", percentOfDailyValue: 18 }]
    },
    portion: { amount: 0.5, unit: "cup", description: "1/2 cup" },
    aiExplanation: "A peanut-free, fiber-rich alternative that's safe against your allergy profile.",
    ingredients: ["Chickpeas", "Olive oil", "Paprika"],
    alternativeMealIds: ["meal-salted-peanuts"]
  }
];

export function toSummary(meal: MealDetail): MealSummary {
  const {
    id,
    name,
    slot,
    imageQuery,
    calories,
    safetyStatus,
    safetyNote,
    isFavorite,
    dietTags
  } = meal;
  return { id, name, slot, imageQuery, calories, safetyStatus, safetyNote, isFavorite, dietTags };
}
