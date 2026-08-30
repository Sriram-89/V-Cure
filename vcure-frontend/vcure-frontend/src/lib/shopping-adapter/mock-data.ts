import type { ProductDetail, StoreDto } from "@/types/shopping";

export const MOCK_STORES: StoreDto[] = [
  { id: "store-freshmart", name: "FreshMart", distanceKm: 1.2 },
  { id: "store-greengrocer", name: "Green Grocer Co-op", distanceKm: 2.5 },
  { id: "store-dailybasket", name: "Daily Basket", distanceKm: 3.8 }
];

export const MOCK_PRODUCTS: ProductDetail[] = [
  {
    id: "product-quinoa",
    name: "Organic Quinoa",
    category: "Grains",
    imageQuery: "bag of quinoa grain",
    unit: "500g pack",
    pricePerUnit: 220,
    availability: "IN_STOCK",
    isFavorite: false,
    brand: "NatureHarvest",
    description: "Whole grain quinoa, a complete plant protein source.",
    nutrition: {
      calories: 120,
      macros: { proteinG: 4, carbsG: 21, fatG: 2 },
      micronutrients: [{ name: "Iron", amount: "1.5mg", percentOfDailyValue: 8 }]
    },
    healthyAlternativeIds: ["product-brown-rice"]
  },
  {
    id: "product-brown-rice",
    name: "Brown Rice",
    category: "Grains",
    imageQuery: "brown rice bag",
    unit: "1kg pack",
    pricePerUnit: 110,
    availability: "IN_STOCK",
    isFavorite: false,
    brand: "FarmFresh",
    description: "Whole grain brown rice, high in fiber.",
    nutrition: {
      calories: 110,
      macros: { proteinG: 2.5, carbsG: 23, fatG: 1 },
      micronutrients: [{ name: "Magnesium", amount: "44mg", percentOfDailyValue: 10 }]
    },
    healthyAlternativeIds: ["product-quinoa"]
  },
  {
    id: "product-greek-yogurt",
    name: "Greek Yogurt",
    category: "Dairy",
    imageQuery: "greek yogurt tub",
    unit: "400g tub",
    pricePerUnit: 150,
    availability: "IN_STOCK",
    isFavorite: true,
    brand: "PureDairy",
    description: "High-protein strained yogurt.",
    nutrition: {
      calories: 100,
      macros: { proteinG: 10, carbsG: 6, fatG: 3 },
      micronutrients: [{ name: "Calcium", amount: "150mg", percentOfDailyValue: 15 }]
    },
    healthyAlternativeIds: ["product-soy-yogurt"]
  },
  {
    id: "product-soy-yogurt",
    name: "Soy Yogurt (Unsweetened)",
    category: "Dairy",
    imageQuery: "soy yogurt cup plant based",
    unit: "350g tub",
    pricePerUnit: 180,
    availability: "LIMITED",
    isFavorite: false,
    brand: "PlantPure",
    description: "Dairy-free fermented soy yogurt.",
    nutrition: {
      calories: 80,
      macros: { proteinG: 6, carbsG: 4, fatG: 4 },
      micronutrients: [{ name: "Calcium", amount: "120mg", percentOfDailyValue: 12 }]
    },
    healthyAlternativeIds: ["product-greek-yogurt"]
  },
  {
    id: "product-spinach",
    name: "Fresh Spinach",
    category: "Produce",
    imageQuery: "fresh spinach bunch",
    unit: "250g bunch",
    pricePerUnit: 40,
    availability: "IN_STOCK",
    isFavorite: false,
    brand: "Local Farms",
    description: "Leafy green, rich in iron and folate.",
    nutrition: {
      calories: 23,
      macros: { proteinG: 2.9, carbsG: 3.6, fatG: 0.4 },
      micronutrients: [{ name: "Iron", amount: "2.7mg", percentOfDailyValue: 15 }]
    },
    healthyAlternativeIds: []
  },
  {
    id: "product-chicken-breast",
    name: "Chicken Breast",
    category: "Protein",
    imageQuery: "raw chicken breast package",
    unit: "500g pack",
    pricePerUnit: 280,
    availability: "IN_STOCK",
    isFavorite: false,
    brand: "FarmFresh",
    description: "Skinless, boneless chicken breast.",
    nutrition: {
      calories: 165,
      macros: { proteinG: 31, carbsG: 0, fatG: 3.6 },
      micronutrients: [{ name: "Vitamin B6", amount: "0.6mg", percentOfDailyValue: 35 }]
    },
    healthyAlternativeIds: ["product-tofu"]
  },
  {
    id: "product-tofu",
    name: "Firm Tofu",
    category: "Protein",
    imageQuery: "firm tofu block package",
    unit: "400g pack",
    pricePerUnit: 90,
    availability: "IN_STOCK",
    isFavorite: false,
    brand: "PlantPure",
    description: "Plant-based protein made from soybeans.",
    nutrition: {
      calories: 76,
      macros: { proteinG: 8, carbsG: 1.9, fatG: 4.8 },
      micronutrients: [{ name: "Calcium", amount: "350mg", percentOfDailyValue: 35 }]
    },
    healthyAlternativeIds: ["product-chicken-breast"]
  },
  {
    id: "product-salted-peanuts",
    name: "Salted Peanuts",
    category: "Snacks",
    imageQuery: "salted peanuts snack pack",
    unit: "200g pack",
    pricePerUnit: 75,
    availability: "IN_STOCK",
    isFavorite: false,
    brand: "SnackCo",
    description: "Roasted and salted peanuts.",
    nutrition: {
      calories: 170,
      macros: { proteinG: 7, carbsG: 5, fatG: 14 },
      micronutrients: [{ name: "Niacin", amount: "3.8mg", percentOfDailyValue: 24 }]
    },
    healthyAlternativeIds: ["product-roasted-chickpeas"]
  },
  {
    id: "product-roasted-chickpeas",
    name: "Roasted Chickpeas",
    category: "Snacks",
    imageQuery: "roasted chickpeas snack pack",
    unit: "150g pack",
    pricePerUnit: 95,
    availability: "OUT_OF_STOCK",
    isFavorite: false,
    brand: "SnackCo",
    description: "Crunchy, peanut-free roasted chickpea snack.",
    nutrition: {
      calories: 140,
      macros: { proteinG: 6, carbsG: 20, fatG: 3 },
      micronutrients: [{ name: "Fiber", amount: "5g", percentOfDailyValue: 18 }]
    },
    healthyAlternativeIds: ["product-salted-peanuts"]
  }
];

export function toProductSummary(product: ProductDetail) {
  const { brand: _brand, description: _description, healthyAlternativeIds: _alts, ...summary } = product;
  return summary;
}
