"use client";

import { useState } from "react";
import { Stethoscope, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";

const COMMON_CONDITIONS = [
  "Hypertension (High BP)",
  "Chronic Kidney Disease (CKD)",
  "Fatty Liver / Cirrhosis",
  "Thyroid (Hypo/Hyperthyroid)",
  "Celiac Disease",
  "PCOS / PCOD",
  "High Cholesterol / Dyslipidemia",
  "Acid Reflux / GERD"
];

export function MedicalConditionsStep() {
  const draft = useOnboardingStore((state) => state.draft.medicalConditions);
  const updateMedicalConditions = useOnboardingStore((state) => state.updateMedicalConditions);
  const goNext = useOnboardingStore((state) => state.goNext);
  const goBack = useOnboardingStore((state) => state.goBack);

  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    draft.conditions || []
  );

  const toggleCondition = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition));
    } else {
      setSelectedConditions([...selectedConditions, condition]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMedicalConditions({ conditions: selectedConditions });
    goNext();
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 flex items-start gap-3 text-xs text-emerald-900 shadow-xs">
        <Stethoscope className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Medical Condition Guidance:</p>
          <p className="mt-0.5 leading-relaxed font-medium">
            Selecting active conditions allows our Medical Rule Engine to filter out high-sodium, high-potassium, or contraindicated ingredients.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
          Select Other Diagnosed Conditions
        </label>
        <div className="grid grid-cols-1 gap-2.5 pt-1">
          {COMMON_CONDITIONS.map((cond) => {
            const isSelected = selectedConditions.includes(cond);
            return (
              <div
                key={cond}
                onClick={() => toggleCondition(cond)}
                className={`cursor-pointer flex items-center justify-between rounded-2xl border p-3.5 text-xs font-bold transition-all shadow-xs ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-600/20"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{cond}</span>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected ? <Check className="h-3.5 w-3.5" /> : null}
                </div>
              </div>
            );
          })}
        </div>
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
