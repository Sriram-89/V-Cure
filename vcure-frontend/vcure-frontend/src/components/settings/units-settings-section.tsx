"use client";

import { Ruler } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import { SaveStatus } from "@/components/settings/save-status";
import { useSaveStatus } from "@/hooks/use-save-status";
import { useUnitsPreference, useUpdateUnitsPreference } from "@/hooks/use-settings";
import type { HeightUnit, WeightUnit } from "@/types/settings";

const HEIGHT_OPTIONS = [
  { value: "cm", label: "Centimeters (cm)" },
  { value: "ft_in", label: "Feet & inches" }
];
const WEIGHT_OPTIONS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "lb", label: "Pounds (lb)" }
];

export function UnitsSettingsSection() {
  const { data, isLoading, isError } = useUnitsPreference();
  const updateUnits = useUpdateUnitsPreference();
  const status = useSaveStatus(updateUnits);

  if (isLoading) return <div className="h-40 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load units.</p>;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Ruler className="h-4 w-4" aria-hidden="true" />
          Units
        </h2>
        <SaveStatus status={status} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <SelectField
          label="Height"
          options={HEIGHT_OPTIONS}
          value={data.heightUnit}
          onChange={(event) =>
            updateUnits.mutate({ ...data, heightUnit: event.target.value as HeightUnit })
          }
        />
        <SelectField
          label="Weight"
          options={WEIGHT_OPTIONS}
          value={data.weightUnit}
          onChange={(event) =>
            updateUnits.mutate({ ...data, weightUnit: event.target.value as WeightUnit })
          }
        />
      </div>
    </div>
  );
}
