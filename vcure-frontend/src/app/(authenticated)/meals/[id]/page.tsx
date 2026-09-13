"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Sparkles, CheckCircle2, Play, UtensilsCrossed } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useSwipeBack } from "@/hooks/use-swipe-back";

const MEAL_DETAILS_SEED = {
  id: "vegetable-oats-upma",
  title: "Vegetable Oats Upma",
  mealType: "BREAKFAST",
  prepTime: "15 min",
  giTag: "low GI",
  difficulty: "Easy",
  calories: 280,
  protein: "9g",
  carbs: "42g",
  fat: "8g",
  fiber: "6g",
  img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  whyThisMeal: [
    "6g fiber per serving — keeps you full longer.",
    "Low glycemic index prevents blood sugar spikes for Type 2 Diabetes."
  ],
  ingredients: [
    "1 cup rolled oats",
    "1 chopped onion",
    "1 chopped tomato",
    "1 chopped carrot",
    "5-6 curry leaves",
    "1 tsp mustard seeds",
    "1 tsp urad dal",
    "1 green chili",
    "1 tbsp olive oil",
    "Salt to taste",
    "Fresh coriander"
  ],
  steps: [
    "Dry-roast the oats on low flame for 3-4 minutes; keep aside.",
    "Heat oil, splutter mustard seeds & urad dal, add curry leaves and green chili.",
    "Add onion, sauté till translucent. Add carrot & tomato; cook 3 minutes.",
    "Add 2 cups hot water and salt; bring to boil.",
    "Stir in roasted oats slowly, cook covered 5 minutes on low.",
    "Garnish with coriander and serve hot."
  ],
  alternatives: [
    { title: "Beaten Rice Poha", calories: "260 kcal", img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80" },
    { title: "Moong Dal Cheela", calories: "250 kcal", img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80" }
  ]
};

import { useProgressStore } from "@/store/progress-store";

export default function MealDetailPage() {
  const router = useRouter();
  useSwipeBack("/meals");

  const meal = MEAL_DETAILS_SEED;
  const eatenMealIds = useProgressStore((state) => state.eatenMealIds);
  const toggleMealEaten = useProgressStore((state) => state.toggleMealEaten);
  const isEaten = eatenMealIds.includes(meal.id);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/meals");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Top Full Image with Round Back Button */}
      <div className="relative h-64 w-full">
        <img
          src={meal.img}
          alt={meal.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

        <button
          type="button"
          onClick={handleBack}
          className="absolute top-6 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all cursor-pointer"
          aria-label="Back to meals"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-6 right-6 text-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            {meal.mealType}
          </span>
          <h1 className="text-2xl font-black text-white">{meal.title}</h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Clock className="inline h-3 w-3 mr-1" />
              {meal.prepTime}
            </span>
            <span className="rounded-full bg-emerald-500/80 px-2.5 py-0.5 text-xs font-bold text-white">
              {meal.giTag}
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              {meal.difficulty}
            </span>
          </div>
        </div>
      </div>

      <Container className="max-w-md px-4 pt-6 space-y-6">
        {/* Macro Summary Row (5 cards) */}
        <div className="grid grid-cols-5 gap-1.5 text-center">
          <div className="rounded-2xl bg-white p-2.5 shadow-xs border border-gray-100">
            <div className="text-sm font-black text-gray-900">{meal.calories}</div>
            <div className="text-[10px] font-bold text-gray-400">Cal</div>
          </div>
          <div className="rounded-2xl bg-white p-2.5 shadow-xs border border-gray-100">
            <div className="text-sm font-black text-gray-900">{meal.protein}</div>
            <div className="text-[10px] font-bold text-gray-400">Protein</div>
          </div>
          <div className="rounded-2xl bg-white p-2.5 shadow-xs border border-gray-100">
            <div className="text-sm font-black text-gray-900">{meal.carbs}</div>
            <div className="text-[10px] font-bold text-gray-400">Carbs</div>
          </div>
          <div className="rounded-2xl bg-white p-2.5 shadow-xs border border-gray-100">
            <div className="text-sm font-black text-gray-900">{meal.fat}</div>
            <div className="text-[10px] font-bold text-gray-400">Fat</div>
          </div>
          <div className="rounded-2xl bg-white p-2.5 shadow-xs border border-gray-100">
            <div className="text-sm font-black text-gray-900">{meal.fiber}</div>
            <div className="text-[10px] font-bold text-gray-400">Fiber</div>
          </div>
        </div>

        {/* Why This Meal Section */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <Sparkles className="h-4 w-4 text-emerald-600 fill-emerald-600" />
            Why this meal?
          </div>
          <ul className="space-y-1.5 text-xs text-gray-700">
            {meal.whyThisMeal.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 font-medium">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
          <p className="text-[10px] italic text-gray-400 pt-1">
            This is educational information only and not medical advice. Consult your healthcare professional for personalized medical guidance.
          </p>
        </div>

        {/* Ingredients Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Ingredients</h2>
          <div className="space-y-2">
            {meal.ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-gray-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100 shrink-0" />
                <span>{ing}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How to Prepare Section */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">How to prepare</h2>
          <div className="space-y-3">
            {meal.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-extrabold text-emerald-800">
                  {idx + 1}
                </span>
                <p className="text-xs font-medium text-gray-700 leading-relaxed pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Watch Tutorial Red Button */}
        <div>
          <button
            type="button"
            className="w-full rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-red-700 transition-all flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 fill-white" />
            Watch tutorial
          </button>
        </div>

        {/* Healthy Alternatives */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900">Healthy alternatives</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {meal.alternatives.map((alt, idx) => (
              <div key={idx} className="w-40 shrink-0 rounded-2xl border border-gray-100 bg-white p-2.5 shadow-xs">
                <img src={alt.img} alt={alt.title} className="h-24 w-full rounded-xl object-cover" />
                <h4 className="mt-2 text-xs font-bold text-gray-900 truncate">{alt.title}</h4>
                <p className="text-[10px] font-semibold text-gray-400">{alt.calories}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Sticky Bottom Action Button */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-gradient-to-t from-white via-white to-transparent p-4">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={() => toggleMealEaten(meal.id)}
            className={`w-full rounded-2xl py-3.5 text-base font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isEaten ? "bg-emerald-800" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            <UtensilsCrossed className="h-5 w-5" />
            {isEaten ? "✓ Marked as Eaten" : "Mark as eaten"}
          </button>
        </div>
      </div>
    </div>
  );
}
