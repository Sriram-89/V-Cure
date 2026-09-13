"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Utensils, Egg, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { foodPreferencesSchema, type FoodPreferencesFormValues } from "@/lib/validation/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";
import type { DietType, RegionalCuisine } from "@/types/onboarding";

const DIET_TYPES: { value: DietType; label: string; desc: string }[] = [
  { value: "VEGETARIAN", label: "Vegetarian", desc: "Plant-based foods, dairy, legumes & whole grains" },
  { value: "EGGETARIAN", label: "Eggetarian", desc: "Vegetarian diet including eggs" },
  { value: "OMNIVORE", label: "Non-Vegetarian / Omnivore", desc: "Includes chicken, fish, eggs, dairy & plant foods" },
  { value: "VEGAN", label: "Vegan", desc: "100% plant-based, no dairy or animal products" },
  { value: "KETO", label: "Keto", desc: "High-fat, ultra-low carb ketogenic pattern" }
];

const REGIONAL_CUISINES: { value: RegionalCuisine; label: string }[] = [
  { value: "ANDHRA", label: "Andhra" },
  { value: "TELANGANA", label: "Telangana" },
  { value: "TAMIL_NADU", label: "Tamil Nadu" },
  { value: "KARNATAKA", label: "Karnataka" },
  { value: "KERALA", label: "Kerala" },
  { value: "MAHARASHTRA", label: "Maharashtra" },
  { value: "NORTH_INDIAN", label: "North Indian" },
  { value: "BENGALI", label: "Bengali" },
  { value: "OTHER", label: "Other / General" }
];

export function FoodPreferencesStep() {
  const draft = useOnboardingStore((state) => state.draft.foodPreferences);
  const updateFoodPreferences = useOnboardingStore((state) => state.updateFoodPreferences);
  const goNext = useOnboardingStore((state) => state.goNext);
  const goBack = useOnboardingStore((state) => state.goBack);

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FoodPreferencesFormValues>({
    resolver: zodResolver(foodPreferencesSchema),
    defaultValues: {
      dietType: draft.dietType || "VEGETARIAN",
      regionalCuisine: draft.regionalCuisine || "ANDHRA",
      eggPreference: draft.eggPreference || false
    }
  });

  const selectedDiet = watch("dietType");
  const selectedCuisine = watch("regionalCuisine");
  const eggPref = watch("eggPreference");

  const onSubmit = (values: FoodPreferencesFormValues) => {
    updateFoodPreferences(values);
    goNext();
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
      {/* Diet Type */}
      <div className="space-y-3">
        <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider">
          Dietary Type
        </label>
        <div className="space-y-2.5">
          {DIET_TYPES.map((dt) => {
            const isSelected = selectedDiet === dt.value;
            return (
              <div
                key={dt.value}
                onClick={() => setValue("dietType", dt.value)}
                className={`cursor-pointer rounded-2xl border p-3.5 transition-all shadow-xs ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Utensils className={`h-4 w-4 ${isSelected ? "text-emerald-600" : "text-gray-400"}`} />
                    <h3 className="text-xs font-bold text-gray-900">{dt.label}</h3>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border ${
                      isSelected ? "border-emerald-600 bg-emerald-600" : "border-gray-300"
                    }`}
                  />
                </div>
                <p className="mt-0.5 text-[11px] font-medium text-gray-500 pl-6.5">{dt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regional Cuisine Selection */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider">
            Which region/cuisine do you usually eat?
          </label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {REGIONAL_CUISINES.map((rc) => {
            const isSelected = selectedCuisine === rc.value;
            return (
              <button
                key={rc.value}
                type="button"
                onClick={() => setValue("regionalCuisine", rc.value)}
                className={`rounded-xl border p-2.5 text-xs font-bold transition-all text-center ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-1 ring-emerald-600"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {rc.label}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-gray-400 font-medium">
          Influences meal recommendations while strictly keeping safety & allergies first.
        </p>
      </div>

      {/* Egg Preference Toggle for Vegetarians */}
      {selectedDiet === "VEGETARIAN" || selectedDiet === "EGGETARIAN" ? (
        <div
          onClick={() => setValue("eggPreference", !eggPref)}
          className="cursor-pointer flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-3.5 shadow-xs hover:border-gray-300"
        >
          <div className="flex items-center gap-3">
            <Egg className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-gray-900">Include Eggs in meal plans?</h4>
              <p className="text-[11px] font-medium text-gray-400">Boiled eggs, omelettes, and egg bhurji options</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={eggPref}
            onChange={() => {}}
            className="h-5 w-5 rounded-md border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
        </div>
      ) : null}

      {errors.dietType ? (
        <p className="text-xs text-red-600 font-semibold">{errors.dietType.message}</p>
      ) : null}

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          className="rounded-2xl border-gray-200 text-xs font-bold text-gray-600"
        >
          ← Back
        </Button>
        <Button type="submit" className="rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700">
          Continue →
        </Button>
      </div>
    </form>
  );
}
