"use client";

import { useState } from "react";
import { AlertCircle, Scale, Dumbbell, HeartPulse, Activity, Sparkles } from "lucide-react";
import { RadioCardGroup } from "@/components/ui/radio-card-group";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/profile/section-card";
import { goalsSchema, type GoalsFormValues } from "@/lib/validation/profile";
import { useHealthGoals, useUpdateHealthGoals, getProfileErrorMessage } from "@/hooks/use-profile";

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
const LABELS: Record<string, string> = Object.fromEntries(
  [...GOAL_OPTIONS, ...TIMELINE_OPTIONS].map((o) => [o.value, o.label])
);

export function GoalsSection() {
  const [isEditing, setIsEditing] = useState(false);
  const { data, isLoading, isError } = useHealthGoals();
  const updateGoals = useUpdateHealthGoals();
  const [draft, setDraft] = useState<Partial<GoalsFormValues>>({});
  const [fieldErrors, setFieldErrors] = useState<{ primaryGoal?: string; timeline?: string }>({});

  const startEditing = () => {
    setDraft({ primaryGoal: data?.primaryGoal, timeline: data?.timeline });
    setFieldErrors({});
    setIsEditing((prev) => !prev);
  };

  const handleSave = () => {
    const result = goalsSchema.safeParse(draft);
    if (!result.success) {
      const errors: typeof fieldErrors = {};
      for (const issue of result.error.issues) {
        errors[issue.path[0] as keyof typeof errors] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    updateGoals.mutate(result.data, { onSuccess: () => setIsEditing(false) });
  };

  return (
    <SectionCard
      title="Health goals"
      isLoading={isLoading}
      isError={isError}
      isEditing={isEditing}
      onEditToggle={startEditing}
    >
      {isEditing ? (
        <div className="flex flex-col gap-5">
          {updateGoals.isError ? (
            <div role="alert" className="flex items-center gap-2 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {getProfileErrorMessage(updateGoals.error)}
            </div>
          ) : null}
          <RadioCardGroup
            name="primaryGoal"
            label="Primary goal"
            options={GOAL_OPTIONS}
            value={draft.primaryGoal}
            onChange={(value) => setDraft((prev) => ({ ...prev, primaryGoal: value as GoalsFormValues["primaryGoal"] }))}
            error={fieldErrors.primaryGoal}
          />
          <RadioCardGroup
            name="timeline"
            label="Timeline"
            options={TIMELINE_OPTIONS}
            value={draft.timeline}
            onChange={(value) => setDraft((prev) => ({ ...prev, timeline: value as GoalsFormValues["timeline"] }))}
            error={fieldErrors.timeline}
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={handleSave} isLoading={updateGoals.isPending}>
              Save changes
            </Button>
          </div>
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-text-secondary">Primary goal</dt>
          <dd className="text-text-primary">{LABELS[data?.primaryGoal ?? ""]}</dd>
          <dt className="text-text-secondary">Timeline</dt>
          <dd className="text-text-primary">{LABELS[data?.timeline ?? ""]}</dd>
        </dl>
      )}
    </SectionCard>
  );
}
