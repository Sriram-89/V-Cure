import { type OnboardingDraft } from "@/store/onboarding-store";
import type { RegionalCuisine } from "@/types/onboarding";

export interface MealRecommendationItem {
  id: string;
  type: "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";
  name: string;
  calories: string;
  protein: string;
  fiber: string;
  giTag: "low GI" | "medium GI";
  img: string;
  reason: string;
  ingredients: string[];
  isVegetarian: boolean;
  cuisines: RegionalCuisine[];
  conditions?: string[];
  symptoms?: string[];
  isBlockedBySafety?: boolean;
  blockedReason?: string;
}

export const ALL_CATALOG_MEALS: MealRecommendationItem[] = [
  // --- BREAKFAST ---
  {
    id: "pesarattu-upma",
    type: "BREAKFAST",
    name: "Andhra Whole Moong Pesarattu with Ginger Chutney",
    calories: "270 kcal",
    protein: "13g P",
    fiber: "7g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80",
    reason: "Traditional Andhra green gram crepe rich in plant protein and low GI fiber.",
    ingredients: ["Green gram (moong)", "Ginger", "Green chili", "Coriander", "Cumin"],
    isVegetarian: true,
    cuisines: ["ANDHRA", "TELANGANA"]
  },
  {
    id: "vegetable-oats-upma",
    type: "BREAKFAST",
    name: "Vegetable Oats Upma",
    calories: "280 kcal",
    protein: "9g P",
    fiber: "6g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
    reason: "Soluble beta-glucan fiber prevents post-meal glucose spikes.",
    ingredients: ["Rolled oats", "Carrots", "Peanuts", "Mustard seeds", "Curry leaves"],
    isVegetarian: true,
    cuisines: ["SOUTH_INDIAN" as any, "ANDHRA", "TELANGANA", "TAMIL_NADU", "KARNATAKA"]
  },
  {
    id: "ragi-dosa-curd",
    type: "BREAKFAST",
    name: "Karnataka Ragi Dosa with Coconut Mint Chutney",
    calories: "240 kcal",
    protein: "8g P",
    fiber: "8g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80",
    reason: "Finger millet provides calcium, iron, and slow-release low GI starch.",
    ingredients: ["Ragi flour", "Urad dal", "Mint", "Coconut", "Green chili"],
    isVegetarian: true,
    cuisines: ["KARNATAKA", "TAMIL_NADU"]
  },
  {
    id: "moong-dal-cheela",
    type: "BREAKFAST",
    name: "Moong Dal Cheela with Curd",
    calories: "250 kcal",
    protein: "14g P",
    fiber: "7g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80",
    reason: "High protein & low GI — ideal for prediabetes & Type 2 glycemic control.",
    ingredients: ["Moong dal", "Curd", "Coriander", "Green chili", "Spices"],
    isVegetarian: true,
    cuisines: ["NORTH_INDIAN", "MAHARASHTRA", "BENGALI"]
  },
  {
    id: "boiled-egg-whole-wheat-toast",
    type: "BREAKFAST",
    name: "Boiled Eggs with Whole Grain Toast",
    calories: "290 kcal",
    protein: "16g P",
    fiber: "4g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=80",
    reason: "High protein breakfast supporting insulin sensitivity.",
    ingredients: ["Eggs", "Whole grain bread", "Black pepper", "Olive oil"],
    isVegetarian: false,
    cuisines: ["OTHER", "NORTH_INDIAN"]
  },

  // --- LUNCH ---
  {
    id: "andhra-brown-rice-sambar",
    type: "LUNCH",
    name: "Andhra Style Drumstick Sambar with Brown Rice",
    calories: "380 kcal",
    protein: "15g P",
    fiber: "9g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80",
    reason: "Protein-rich Toor dal sambar paired with unpolished fiber-rich brown rice.",
    ingredients: ["Brown rice", "Toor dal", "Drumstick", "Tomatoes", "Sambar spices"],
    isVegetarian: true,
    cuisines: ["ANDHRA", "TELANGANA"]
  },
  {
    id: "dal-tadka-roti",
    type: "LUNCH",
    name: "Dal Tadka with Multigrain Roti",
    calories: "420 kcal",
    protein: "18g P",
    fiber: "9g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
    reason: "Complex carbs + lentil protein for sustained afternoon energy.",
    ingredients: ["Yellow lentils", "Multigrain flour", "Tomatoes", "Ghee", "Spices"],
    isVegetarian: true,
    cuisines: ["NORTH_INDIAN", "MAHARASHTRA"]
  },
  {
    id: "jowar-bhakri-pitla",
    type: "LUNCH",
    name: "Maharashtrian Jowar Bhakri with Methi Pitla",
    calories: "360 kcal",
    protein: "13g P",
    fiber: "10g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
    reason: "Sorghum (jowar) and fenugreek (methi) provide excellent glucose stabilization.",
    ingredients: ["Jowar flour", "Besan", "Methi leaves", "Garlic", "Green chili"],
    isVegetarian: true,
    cuisines: ["MAHARASHTRA", "KARNATAKA"]
  },
  {
    id: "kerala-red-rice-fish-curry",
    type: "LUNCH",
    name: "Kerala Red Matta Rice with Fish Curry & Veggies",
    calories: "410 kcal",
    protein: "28g P",
    fiber: "7g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80",
    reason: "Red Matta rice has low GI starch paired with lean Omega-3 fish protein.",
    ingredients: ["Matta rice", "Fish", "Kokum", "Coconut milk", "Turmeric"],
    isVegetarian: false,
    cuisines: ["KERALA"]
  },
  {
    id: "bengali-sorshe-maach-roti",
    type: "LUNCH",
    name: "Bengali Shorshe Maach with Whole Wheat Roti",
    calories: "400 kcal",
    protein: "29g P",
    fiber: "6g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80",
    reason: "Mustard gravy provides healthy plant fats and anti-inflammatory allyl isothiocyanates.",
    ingredients: ["Rohu fish", "Mustard paste", "Green chili", "Atta roti", "Turmeric"],
    isVegetarian: false,
    cuisines: ["BENGALI"]
  },

  // --- SNACK ---
  {
    id: "sprouts-salad",
    type: "SNACK",
    name: "Sprouts & Cucumber Salad",
    calories: "180 kcal",
    protein: "12g P",
    fiber: "7g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
    reason: "Nutrient-dense, low-calorie snack with zero added sugar.",
    ingredients: ["Mung sprouts", "Cucumber", "Lemon juice", "Chaat masala"],
    isVegetarian: true,
    cuisines: ["ANDHRA", "TELANGANA", "MAHARASHTRA", "NORTH_INDIAN", "TAMIL_NADU", "KARNATAKA"]
  },
  {
    id: "roasted-chana-nuts",
    type: "SNACK",
    name: "Roasted Chana & Almonds",
    calories: "210 kcal",
    protein: "10g P",
    fiber: "5g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1490474418585-ba9ids0ea?auto=format&fit=crop&w=400&q=80",
    reason: "Healthy fats & plant protein for pre-dinner satiety.",
    ingredients: ["Roasted chana", "Almonds"],
    isVegetarian: true,
    cuisines: ["NORTH_INDIAN", "ANDHRA", "TELANGANA", "MAHARASHTRA"]
  },

  // --- DINNER & ACUTE SYMPTOM SAFE MEALS ---
  {
    id: "moong-dal-khichdi-curd",
    type: "DINNER",
    name: "Hydrating Moong Dal Khichdi with Curd",
    calories: "320 kcal",
    protein: "12g P",
    fiber: "6g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
    reason: "Gentle, easily digestible gut-soothing meal. Recommended for hydration & recovery during fever or digestive discomfort.",
    ingredients: ["Moong dal", "Rice", "Cumin", "Ghee", "Curd"],
    isVegetarian: true,
    cuisines: ["ANDHRA", "TELANGANA", "NORTH_INDIAN", "MAHARASHTRA", "TAMIL_NADU", "KARNATAKA", "KERALA", "BENGALI", "OTHER"],
    symptoms: ["FEVER", "DIARRHEA", "LOOSE_MOTION"]
  },
  {
    id: "grilled-paneer-veggies",
    type: "DINNER",
    name: "Grilled Paneer & Roasted Vegetables",
    calories: "380 kcal",
    protein: "24g P",
    fiber: "6g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80",
    reason: "Low carb, high protein dinner for optimal nighttime blood sugar control.",
    ingredients: ["Paneer", "Bell peppers", "Zucchini", "Olive oil", "Herbs"],
    isVegetarian: true,
    cuisines: ["NORTH_INDIAN", "ANDHRA", "TELANGANA", "MAHARASHTRA"]
  },
  {
    id: "baked-fish-steamed-veggies",
    type: "DINNER",
    name: "Baked Fish with Steamed Vegetables",
    calories: "360 kcal",
    protein: "30g P",
    fiber: "5g fiber",
    giTag: "low GI",
    img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80",
    reason: "High protein, low carb dinner rich in Omega-3 fatty acids.",
    ingredients: ["Fish fillet", "Broccoli", "Carrots", "Lemon", "Herbs"],
    isVegetarian: false,
    cuisines: ["KERALA", "BENGALI", "OTHER"]
  }
];

export function getSafeMealsForUser(draft: Partial<OnboardingDraft>): MealRecommendationItem[] {
  if (!draft) return ALL_CATALOG_MEALS;

  const userAllergies = [
    ...(draft.allergies?.allergies || []),
    ...(draft.medicalProfile?.allergies || [])
  ].map((a) => String(a).toLowerCase());

  const dietType = draft.foodPreferences?.dietType || "VEGETARIAN";
  const userRegionalCuisine = draft.foodPreferences?.regionalCuisine || "ANDHRA";
  const diabetesCategory = draft.diabetesCategory?.category || "PREDIABETES";

  // 1. FILTER MEALS BY SAFETY ENGINE & ALLERGIES
  const safeFiltered = ALL_CATALOG_MEALS.filter((meal) => {
    // Diet Type Gate
    if (dietType === "VEGETARIAN" || dietType === "VEGAN") {
      if (!meal.isVegetarian) return false;
    }

    // Safety Gate: Hard Block on Allergies
    const containsAllergy = meal.ingredients.some((ing) =>
      userAllergies.some((allergy) =>
        ing.toLowerCase().includes(allergy) || allergy.includes(ing.toLowerCase())
      )
    );

    if (containsAllergy) {
      return false; // Hard-blocked by Safety Engine
    }

    return true;
  });

  // 2. RANKING BY REGIONAL PREFERENCE WHILE MAINTAINING SAFETY
  const sortedByRegionalPreference = [...safeFiltered].sort((a, b) => {
    const aMatch = a.cuisines?.includes(userRegionalCuisine) ? 1 : 0;
    const bMatch = b.cuisines?.includes(userRegionalCuisine) ? 1 : 0;
    return bMatch - aMatch;
  });

  // 3. TAILOR REASON MESSAGING FOR SPECIFIC MEDICAL CATEGORIES
  return sortedByRegionalPreference.map((meal) => {
    let tailoredReason = meal.reason;
    if (diabetesCategory === "TYPE1_DIABETES") {
      tailoredReason = `${meal.reason} [Type 1 Note: Carbohydrate awareness required. Consult your care team for insulin dosing.]`;
    } else if (diabetesCategory === "GESTATIONAL_DIABETES") {
      tailoredReason = `${meal.reason} [Gestational Note: High-safety prenatal nutrition pattern.]`;
    }
    return { ...meal, reason: tailoredReason };
  });
}

export function getPersonalizedMealsForUser(draft: Partial<OnboardingDraft>): MealRecommendationItem[] {
  const safeMeals = getSafeMealsForUser(draft);
  const slots: ("BREAKFAST" | "LUNCH" | "SNACK" | "DINNER")[] = [
    "BREAKFAST",
    "LUNCH",
    "SNACK",
    "DINNER"
  ];
  const primaryMeals: MealRecommendationItem[] = [];

  for (const slot of slots) {
    const match = safeMeals.find((m) => m.type === slot);
    if (match) {
      primaryMeals.push(match);
    }
  }

  return primaryMeals;
}

export function getSafeAlternativesForSlot(
  slot: "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER",
  currentPrimaryMealId: string,
  draft: Partial<OnboardingDraft>
): MealRecommendationItem[] {
  const safeMeals = getSafeMealsForUser(draft);
  return safeMeals.filter((m) => m.type === slot && m.id !== currentPrimaryMealId);
}
