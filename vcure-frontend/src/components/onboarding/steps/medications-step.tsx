"use client";

import { useState } from "react";
import { Pill, Plus, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";

const POPULAR_MEDS = ["Metformin", "Warfarin", "Insulin", "Amlodipine", "Levothyroxine", "Atorvastatin"];

export function MedicationsStep() {
  const draft = useOnboardingStore((state) => state.draft.medications);
  const updateMedications = useOnboardingStore((state) => state.updateMedications);
  const goNext = useOnboardingStore((state) => state.goNext);
  const goBack = useOnboardingStore((state) => state.goBack);

  const [medList, setMedList] = useState<string[]>(draft.medications || []);
  const [medInput, setMedInput] = useState("");

  const handleAddMed = (medName: string) => {
    if (medName.trim() && !medList.includes(medName.trim())) {
      setMedList([...medList, medName.trim()]);
      setMedInput("");
    }
  };

  const handleRemoveMed = (medName: string) => {
    setMedList(medList.filter((m) => m !== medName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMedications({ medications: medList });
    goNext();
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 flex items-start gap-3 text-xs text-blue-900 shadow-xs">
        <Pill className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Drug-Food Interaction Checks:</p>
          <p className="mt-0.5 leading-relaxed font-medium">
            Active medications are cross-referenced with curated drug-food interaction catalogs (e.g. Warfarin vs high Vitamin K foods).
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          Current Medications
        </label>

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={medInput}
            onChange={(e) => setMedInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddMed(medInput))}
            placeholder="Type medicine name (e.g. Metformin 500mg)"
            className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs font-medium text-gray-900 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleAddMed(medInput)}
            className="flex items-center gap-1 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>

        {/* Quick add chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-gray-400 self-center mr-1">Suggestions:</span>
          {POPULAR_MEDS.map((suggest) => (
            <button
              key={suggest}
              type="button"
              onClick={() => handleAddMed(suggest)}
              className="rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-200"
            >
              + {suggest}
            </button>
          ))}
        </div>

        {/* Added Medicines List */}
        {medList.length > 0 ? (
          <div className="space-y-2 pt-2">
            {medList.map((med) => (
              <div
                key={med}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3 text-xs font-bold text-gray-800 shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-emerald-600" />
                  {med}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveMed(med)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-[11px] font-medium text-amber-800 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
        <span>V-Cure does not recommend medication changes or calculate insulin/medication doses.</span>
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
