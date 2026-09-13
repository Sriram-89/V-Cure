import type { RecipeDetail, RecipeSummary } from "@/types/recipes";

export const MOCK_RECIPES: RecipeDetail[] = [
  {
    id: "recipe-veg-quinoa-bowl",
    title: "Vegetable Quinoa Power Bowl",
    category: "Lunch",
    imageQuery: "quinoa vegetable power bowl",
    cookingTimeMinutes: 25,
    difficulty: "EASY",
    calories: 430,
    dietTags: ["Vegan", "High Fiber", "Gluten Free"],
    averageRating: 4.6,
    ratingCount: 128,
    isFavorite: false,
    servings: { amount: 2, unit: "bowls", description: "Serves 2" },
    ingredients: [
      { id: "i1", name: "Quinoa", quantity: "1 cup" },
      { id: "i2", name: "Chickpeas", quantity: "1 can" },
      { id: "i3", name: "Cucumber", quantity: "1, diced" },
      { id: "i4", name: "Cherry tomatoes", quantity: "1 cup, halved" },
      { id: "i5", name: "Lemon", quantity: "1, juiced" },
      { id: "i6", name: "Olive oil", quantity: "2 tbsp" }
    ],
    instructions: [
      { step: 1, instruction: "Rinse quinoa and cook according to package instructions." },
      { step: 2, instruction: "Drain and rinse the chickpeas." },
      { step: 3, instruction: "Dice the cucumber and halve the cherry tomatoes." },
      { step: 4, instruction: "Combine quinoa, chickpeas, cucumber, and tomatoes in a bowl." },
      { step: 5, instruction: "Whisk lemon juice and olive oil, then toss through the bowl." }
    ],
    nutrition: {
      calories: 430,
      macros: { proteinG: 17, carbsG: 62, fatG: 14 },
      micronutrients: [
        { name: "Folate", amount: "190µg", percentOfDailyValue: 48 },
        { name: "Iron", amount: "4.2mg", percentOfDailyValue: 23 }
      ]
    },
    allergens: [],
    aiExplanation:
      "Plant-based and high in fiber, this fits a vegan diet type and stays within a moderate calorie range for lunch.",
    similarRecipeIds: ["recipe-lentil-curry"],
    reviews: [
      {
        id: "r1",
        authorName: "Ananya",
        rating: 5,
        comment: "Simple and filling, I make this every week.",
        createdAt: "2026-06-02"
      },
      {
        id: "r2",
        authorName: "Rahul",
        rating: 4,
        comment: "Great base recipe, I added feta for extra protein.",
        createdAt: "2026-05-18"
      }
    ]
  },
  {
    id: "recipe-lentil-curry",
    title: "Red Lentil Curry",
    category: "Dinner",
    imageQuery: "red lentil curry bowl",
    cookingTimeMinutes: 35,
    difficulty: "MEDIUM",
    calories: 380,
    dietTags: ["Vegetarian", "High Fiber", "Gluten Free"],
    averageRating: 4.8,
    ratingCount: 210,
    isFavorite: true,
    servings: { amount: 4, unit: "servings", description: "Serves 4" },
    ingredients: [
      { id: "i1", name: "Red lentils", quantity: "1.5 cups" },
      { id: "i2", name: "Coconut milk", quantity: "1 can" },
      { id: "i3", name: "Onion", quantity: "1, diced" },
      { id: "i4", name: "Garlic", quantity: "3 cloves" },
      { id: "i5", name: "Ginger", quantity: "1 tbsp, minced" },
      { id: "i6", name: "Curry powder", quantity: "2 tbsp" }
    ],
    instructions: [
      { step: 1, instruction: "Sauté onion, garlic, and ginger until fragrant." },
      { step: 2, instruction: "Stir in curry powder and cook for 1 minute." },
      { step: 3, instruction: "Add lentils, coconut milk, and 2 cups water." },
      { step: 4, instruction: "Simmer for 20-25 minutes until lentils are soft." },
      { step: 5, instruction: "Season to taste and serve with rice or flatbread." }
    ],
    nutrition: {
      calories: 380,
      macros: { proteinG: 16, carbsG: 48, fatG: 14 },
      micronutrients: [
        { name: "Iron", amount: "5.1mg", percentOfDailyValue: 28 },
        { name: "Folate", amount: "230µg", percentOfDailyValue: 58 }
      ]
    },
    allergens: [],
    aiExplanation:
      "Warming and iron-rich, a good dinner option that pairs well with your logged conditions and vegetarian preference.",
    similarRecipeIds: ["recipe-veg-quinoa-bowl", "recipe-chicken-stir-fry"],
    reviews: [
      {
        id: "r3",
        authorName: "Priya",
        rating: 5,
        comment: "Restaurant quality. My family asks for this weekly.",
        createdAt: "2026-06-10"
      }
    ]
  },
  {
    id: "recipe-chicken-stir-fry",
    title: "Ginger Chicken Stir-Fry",
    category: "Dinner",
    imageQuery: "chicken stir fry vegetables",
    cookingTimeMinutes: 20,
    difficulty: "EASY",
    calories: 460,
    dietTags: ["High Protein", "Low Carb"],
    averageRating: 4.5,
    ratingCount: 95,
    isFavorite: false,
    servings: { amount: 2, unit: "servings", description: "Serves 2" },
    ingredients: [
      { id: "i1", name: "Chicken breast", quantity: "300g, sliced" },
      { id: "i2", name: "Broccoli", quantity: "1 cup, florets" },
      { id: "i3", name: "Bell pepper", quantity: "1, sliced" },
      { id: "i4", name: "Soy sauce", quantity: "3 tbsp" },
      { id: "i5", name: "Ginger", quantity: "1 tbsp, minced" }
    ],
    instructions: [
      { step: 1, instruction: "Heat oil in a wok over high heat." },
      { step: 2, instruction: "Stir-fry chicken until cooked through, then set aside." },
      { step: 3, instruction: "Stir-fry broccoli and bell pepper for 3-4 minutes." },
      { step: 4, instruction: "Return chicken to the wok, add soy sauce and ginger." },
      { step: 5, instruction: "Toss everything together for 1-2 minutes and serve." }
    ],
    nutrition: {
      calories: 460,
      macros: { proteinG: 38, carbsG: 18, fatG: 22 },
      micronutrients: [
        { name: "Vitamin C", amount: "95mg", percentOfDailyValue: 106 },
        { name: "Vitamin B6", amount: "1.0mg", percentOfDailyValue: 59 }
      ]
    },
    allergens: ["Soy"],
    aiExplanation:
      "High-protein and quick to prepare, fitting well within a low-carb approach for dinner.",
    similarRecipeIds: ["recipe-lentil-curry"],
    reviews: []
  }
];

export function toRecipeSummary(recipe: RecipeDetail): RecipeSummary {
  const {
    id,
    title,
    category,
    imageQuery,
    cookingTimeMinutes,
    difficulty,
    calories,
    dietTags,
    averageRating,
    ratingCount,
    isFavorite
  } = recipe;
  return {
    id,
    title,
    category,
    imageQuery,
    cookingTimeMinutes,
    difficulty,
    calories,
    dietTags,
    averageRating,
    ratingCount,
    isFavorite
  };
}
