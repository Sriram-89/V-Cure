"use client";

import { useState } from "react";
import { Scale, Dumbbell, HeartPulse, Activity, Sparkles } from "lucide-react";
import { RadioCardGroup } from "@/components/ui/radio-card-group";
import { Button } from "@/components/ui/button";
import { goalsSchema, type GoalsFormValues } from "@/lib/validation/onboarding";
import { useOnboardingStore } from "@/store/onboarding-store";

const GOAL_OPTIONS = [
  { value: "WEIGHT_LOSS", label: "Lose weight", icon: Scale },
  { value: "WEIGHT_GAIN", label: "Gain weight", icon: Dumbbell },
  { value: "MANAGE_CONDITION", label: "Manage a condition", icon: HeartPulse },
  { value: "IMPROVE_FITNESS", label: "Improve fitness", icon: Activity },
  { value: "GENERAL_WELLNESS", label: "General wellness", icon: Sparkles }
];

const TIMELINE_OPTIONS = [
  { value: "ONE_MONTH", label: "1 month" },
  { value: "THREE_MONTHS", label: "3 months" },
  { value: "SIX_MONTHS", label: "6 months" },
  { value: "ONGOING", label: "Ongoing, no deadline" }
];

export function GoalsStep() {
  const draft = useOnboardingStore((state) => state.draft.goals);
  const updateGoals = useOnboardingStore((state) => state.updateGoals);
  const goNext = useOnboardingStore((state) => state.goNext);
  const goBack = useOnboardingStore((state) => state.goBack);

  const [primaryGoal, setPrimaryGoal] = useState(draft.primaryGoal ?? "");
  const [timeline, setTimeline] = useState(draft.timeline ?? "");
  const [errors, setErrors] = useState<{ primaryGoal?: string; timeline?: string }>({});

  const handleContinue = () => {
    const result = goalsSchema.safeParse({ primaryGoal, timeline } as GoalsFormValues);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof typeof errors;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    updateGoals(result.data);
    goNext();
  };

  return (
    <div className="flex flex-col gap-6">
      <RadioCardGroup
        name="primaryGoal"
        label="What's your main goal right now?"
        options={GOAL_OPTIONS}
        value={primaryGoal}
        onChange={setPrimaryGoal}
        error={errors.primaryGoal}
      />

      <RadioCardGroup
        name="timeline"
        label="What timeline are you working toward?"
        options={TIMELINE_OPTIONS}
        value={timeline}
        onChange={setTimeline}
        error={errors.timeline}
      />

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
