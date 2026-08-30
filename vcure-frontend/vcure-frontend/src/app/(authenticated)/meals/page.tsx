"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ClinicalSafetyFlow } from "@/components/ai-safety/clinical-safety-flow";

const CATEGORIES = ["All", "Breakfast", "Lunch", "Snack", "Dinner"];

const RECIPES_SEED = [
  {
    id: "vegetable-oats-upma",
    title: "Vegetable Oats Upma",
    mealType: "BREAKFAST",
    time: "15 min",
    difficulty: "Easy",
    calories: "280 kcal",
    protein: "P 9g",
    fiber: "Fiber 6g",
    giTag: "low GI",
    giColor: "bg-emerald-100 text-emerald-800",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "beaten-rice-poha",
    title: "Beaten Rice Poha",
    mealType: "BREAKFAST",
    time: "15 min",
    difficulty: "Easy",
    calories: "260 kcal",
    protein: "P 6g",
    fiber: "Fiber 4g",
    giTag: "medium GI",
    giColor: "bg-emerald-100 text-emerald-800",
    img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "steamed-idli-sambar",
    title: "Steamed Idli with Sambar",
    mealType: "BREAKFAST",
    time: "20 min",
    difficulty: "Easy",
    calories: "230 kcal",
    protein: "P 8g",
    fiber: "Fiber 5g",
    giTag: "medium GI",
    giColor: "bg-emerald-100 text-emerald-800",
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "dal-tadka-roti",
    title: "Dal Tadka with Multigrain Roti",
    mealType: "LUNCH",
    time: "30 min",
    difficulty: "Easy",
    calories: "420 kcal",
    protein: "P 18g",
    fiber: "Fiber 9g",
    giTag: "low GI",
    giColor: "bg-emerald-100 text-emerald-800",
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "fruit-nuts-bowl",
    title: "Fruit & Nuts Bowl",
    mealType: "SNACK",
    time: "5 min",
    difficulty: "Easy",
    calories: "220 kcal",
    protein: "P 5g",
    fiber: "Fiber 6g",
    giTag: "low GI",
    giColor: "bg-emerald-100 text-emerald-800",
    img: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "sprouts-salad",
    title: "Sprouts Salad",
    mealType: "SNACK",
    time: "10 min",
    difficulty: "Easy",
    calories: "180 kcal",
    protein: "P 12g",
    fiber: "Fiber 7g",
    giTag: "low GI",
    giColor: "bg-emerald-100 text-emerald-800",
    img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
  }
];

export default function MealsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredRecipes = RECIPES_SEED.filter((recipe) => {
    if (activeCategory === "All") return true;
    return recipe.mealType.toUpperCase() === activeCategory.toUpperCase();
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Container className="max-w-md px-4 py-6 space-y-5">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Meals</h1>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Explore personalized Indian recipes
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all shadow-xs ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* CORE AI CLINICAL SAFETY & RECOMMENDATION FLOW */}
        <ClinicalSafetyFlow />

        {/* Recipe Cards List */}
        <div className="space-y-4">
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/meals/${recipe.id}`}
              className="block overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md hover:shadow-lg transition-all"
            >
              <div className="relative h-44 w-full">
                <img
                  src={recipe.img}
                  alt={recipe.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    {recipe.mealType} • {recipe.time} • {recipe.difficulty}
                  </span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>

                <h3 className="mt-1 text-base font-bold text-gray-900">{recipe.title}</h3>

                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {recipe.calories}
                  </span>
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {recipe.protein}
                  </span>
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                    {recipe.fiber}
                  </span>
                  <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${recipe.giColor}`}>
                    {recipe.giTag}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </div>
  );
}
