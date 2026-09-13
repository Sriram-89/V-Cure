"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Sparkles, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useOnboardingStore } from "@/store/onboarding-store";
import { useMealPlannerStore } from "@/store/meal-planner-store";
import {
  getSafeMealsForUser,
  getSafeAlternativesForSlot,
  ALL_CATALOG_MEALS,
  type MealRecommendationItem
} from "@/lib/meal-adapter/personalized-recommendation-engine";
import type { MealSlot } from "@/types/meals";

const CATEGORIES: ("All" | MealSlot)[] = ["All", "BREAKFAST", "LUNCH", "SNACK", "DINNER"];

const CATEGORY_LABELS: Record<string, string> = {
  All: "All Meals",
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  SNACK: "Snack",
  DINNER: "Dinner"
};

export default function MealsPage() {
  const draft = useOnboardingStore((state) => state.draft);
  const selectedPrimaryMeals = useMealPlannerStore((state) => state.selectedPrimaryMeals);
  const replacePrimaryMeal = useMealPlannerStore((state) => state.replacePrimaryMeal);

  const [activeCategory, setActiveCategory] = useState<"All" | MealSlot>("All");
  const [showAlternativesForSlot, setShowAlternativesForSlot] = useState<Record<string, boolean>>({
    BREAKFAST: true,
    LUNCH: true,
    SNACK: true,
    DINNER: true
  });

  const safeMeals = getSafeMealsForUser(draft);

  // Helper to find safe primary meal for a slot, falling back if saved meal is invalid/allergy-blocked
  const getActivePrimaryMeal = (slot: MealSlot): MealRecommendationItem => {
    const savedId = selectedPrimaryMeals[slot];
    const matchSaved = safeMeals.find((m) => m.type === slot && m.id === savedId);
    if (matchSaved) return matchSaved;

    const matchFirstSafe = safeMeals.find((m) => m.type === slot);
    if (matchFirstSafe) return matchFirstSafe;

    const fallbackCatalogMatch = ALL_CATALOG_MEALS.find((m) => m.type === slot);
    return (
      fallbackCatalogMatch || {
        id: `fallback-${slot.toLowerCase()}`,
        type: slot,
        name: `Personalized ${CATEGORY_LABELS[slot]}`,
        calories: "300 kcal",
        protein: "12g P",
        fiber: "6g fiber",
        giTag: "low GI",
        img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80",
        reason: "Personalized nutrient balanced meal.",
        ingredients: [],
        isVegetarian: true,
        cuisines: ["ANDHRA"]
      }
    );
  };

  const handleSelectAlternative = (slot: MealSlot, newMealId: string) => {
    replacePrimaryMeal(slot, newMealId);
  };

  const toggleAlternativesView = (slot: MealSlot) => {
    setShowAlternativesForSlot((prev) => ({
      ...prev,
      [slot]: !prev[slot]
    }));
  };

  const visibleSlots: MealSlot[] =
    activeCategory === "All"
      ? ["BREAKFAST", "LUNCH", "SNACK", "DINNER"]
      : [activeCategory as MealSlot];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <Container className="max-w-md px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Today's Meal Plan</h1>
            <p className="mt-0.5 text-xs font-medium text-gray-500">
              One personalized meal per slot • Select healthy alternatives to swap
            </p>
          </div>
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white shrink-0 shadow-xs hover:bg-slate-700 transition-all"
            aria-label="Profile"
          >
            S
          </Link>
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
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs shrink-0 ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>

        {/* Meal Slots Section */}
        <div className="space-y-8">
          {visibleSlots.map((slot) => {
            const primaryMeal = getActivePrimaryMeal(slot);
            const alternatives = getSafeAlternativesForSlot(slot, primaryMeal.id, draft);
            const isAltOpen = showAlternativesForSlot[slot] ?? true;

            return (
              <div key={slot} className="space-y-3">
                {/* Slot Title Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
                      Today's {CATEGORY_LABELS[slot]}
                    </h2>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    1 Selected Meal
                  </span>
                </div>

                {/* PRIMARY MEAL CARD */}
                <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-lg relative">
                  <Link href={`/meals/${primaryMeal.id}`} className="block">
                    <div className="relative h-44 w-full">
                      <img
                        src={primaryMeal.img}
                        alt={primaryMeal.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-extrabold text-white shadow-xs uppercase tracking-wider">
                        ACTIVE {slot}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <h3 className="text-lg font-extrabold text-white">{primaryMeal.name}</h3>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {primaryMeal.calories}
                      </span>
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {primaryMeal.protein}
                      </span>
                      <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {primaryMeal.fiber}
                      </span>
                      <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                        {primaryMeal.giTag}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-emerald-900 bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-100 flex items-start gap-1.5">
                      <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{primaryMeal.reason}</span>
                    </p>

                    <div className="pt-1 flex items-center justify-between border-t border-gray-100">
                      <Link
                        href={`/meals/${primaryMeal.id}`}
                        className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline"
                      >
                        View recipe details <ChevronRight className="h-4 w-4" />
                      </Link>

                      {alternatives.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => toggleAlternativesView(slot)}
                          className="text-xs font-bold text-gray-600 hover:text-emerald-700 flex items-center gap-1.5 bg-gray-100 hover:bg-emerald-50 px-3 py-1.5 rounded-xl transition-all"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          {isAltOpen ? "Hide alternatives" : `Healthy alternatives (${alternatives.length})`}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* HEALTHY ALTERNATIVES SECTION */}
                {isAltOpen && alternatives.length > 0 ? (
                  <div className="rounded-3xl border border-gray-100 bg-gray-100/60 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Healthy alternatives for {CATEGORY_LABELS[slot]}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        Tap to replace primary meal
                      </span>
                    </div>

                    <div className="space-y-3">
                      {alternatives.map((alt) => (
                        <div
                          key={alt.id}
                          className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3 shadow-xs hover:border-emerald-300 transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                            <img
                              src={alt.img}
                              alt={alt.name}
                              className="h-14 w-14 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-gray-900 truncate">
                                {alt.name}
                              </h5>
                              <div className="mt-1 flex items-center gap-1 flex-wrap">
                                <span className="text-[10px] font-semibold text-gray-500">
                                  {alt.calories}
                                </span>
                                <span className="text-[10px] font-semibold text-gray-400">•</span>
                                <span className="text-[10px] font-semibold text-gray-500">
                                  {alt.protein}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  {alt.giTag}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSelectAlternative(slot, alt.id)}
                            className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-1"
                          >
                            <span>Select</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
