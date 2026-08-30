"use client";

import { useState } from "react";
import { TagInput } from "@/components/ui/tag-input";
import { Button } from "@/components/ui/button";
import { medicalProfileSchema } from "@/lib/validation/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";

export function MedicalProfileStep() {
  const draft = useOnboardingStore((state) => state.draft.medicalProfile);
  const updateMedicalProfile = useOnboardingStore((state) => state.updateMedicalProfile);
  const goNext = useOnboardingStore((state) => state.goNext);
  const goBack = useOnboardingStore((state) => state.goBack);

  const [conditions, setConditions] = useState<string[]>(draft.conditions);
  const [allergies, setAllergies] = useState<string[]>(draft.allergies);
  const [medications, setMedications] = useState<string[]>(draft.medications);
  const [formError, setFormError] = useState<string | null>(null);

  const handleContinue = () => {
    const result = medicalProfileSchema.safeParse({ conditions, allergies, medications });
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Check the fields above.");
      return;
    }
    setFormError(null);
    updateMedicalProfile(result.data);
    goNext();
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-text-secondary">
        This step is optional but helps the safety layer catch conflicts early.
        Leave a field empty if it doesn&apos;t apply to you.
      </p>

      <TagInput
        label="Existing conditions"
        values={conditions}
        onChange={setConditions}
        placeholder="e.g. Type 2 Diabetes"
        emptyStateLabel="No conditions added yet"
      />

      <TagInput
        label="Allergies"
        values={allergies}
        onChange={setAllergies}
        placeholder="e.g. Peanuts"
        emptyStateLabel="No allergies added yet"
      />

      <TagInput
        label="Current medications"
        values={medications}
        onChange={setMedications}
        placeholder="e.g. Metformin"
        emptyStateLabel="No medications added yet"
      />

      {formError ? (
        <p role="alert" className="text-xs text-danger">
          {formError}
        </p>
      ) : null}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button type="button" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
