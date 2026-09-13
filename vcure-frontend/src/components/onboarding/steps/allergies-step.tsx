"use client";

import { useState } from "react";
import { ShieldAlert, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";

const COMMON_ALLERGIES = [
  "Peanuts",
  "Lactose / Dairy",
  "Gluten / Wheat",
  "Tree Nuts",
  "Soy",
  "Eggs",
  "Shellfish / Seafood",
  "Mustard",
  "Sesame"
];

export function AllergiesStep() {
  const draft = useOnboardingStore((state) => state.draft.allergies);
  const updateAllergies = useOnboardingStore((state) => state.updateAllergies);
  const goNext = useOnboardingStore((state) => state.goNext);
  const goBack = useOnboardingStore((state) => state.goBack);

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    draft.allergies || []
  );
  const [customInput, setCustomInput] = useState("");

  const toggleAllergy = (allergy: string) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== allergy));
    } else {
      setSelectedAllergies([...selectedAllergies, allergy]);
    }
  };

  const handleAddCustom = () => {
    if (customInput.trim() && !selectedAllergies.includes(customInput.trim())) {
      setSelectedAllergies([...selectedAllergies, customInput.trim()]);
      setCustomInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAllergies({
      allergies: selectedAllergies,
      intolerances: []
    });
    goNext();
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-4 flex items-start gap-3 text-xs text-red-900 shadow-xs">
        <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Strict Safety Priority:</p>
          <p className="mt-0.5 leading-relaxed font-medium">
            Meals containing active allergies are hard-blocked by V-Cure's Safety Engine.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          Select Known Allergies & Intolerances
        </label>
        <div className="flex flex-wrap gap-2 pt-1">
          {COMMON_ALLERGIES.map((allergy) => {
            const isSelected = selectedAllergies.includes(allergy);
            return (
              <button
                key={allergy}
                type="button"
                onClick={() => toggleAllergy(allergy)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all border shadow-xs ${
                  isSelected
                    ? "border-red-600 bg-red-600 text-white shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                <span>{allergy}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Custom Allergy */}
      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Add custom food allergy (e.g. Mushrooms)"
          className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium text-gray-900 focus:border-red-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAddCustom}
          className="rounded-2xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-gray-800"
        >
          Add
        </button>
      </div>

      <div className="flex items-center justify-between pt-3">
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
