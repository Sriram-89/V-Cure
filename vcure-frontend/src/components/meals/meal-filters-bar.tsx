"use client";

import { SelectField } from "@/components/ui/select-field";
import { InputField } from "@/components/ui/input-field";
import type { MealFilters } from "@/types/meals";

const DIET_TYPE_OPTIONS = [
  { value: "Vegetarian", label: "Vegetarian" },
  { value: "Vegan", label: "Vegan" },
  { value: "High Protein", label: "High Protein" },
  { value: "Low Carb", label: "Low Carb" },
  { value: "High Fiber", label: "High Fiber" }
];

export function MealFiltersBar({
  filters,
  onChange
}: {
  filters: MealFilters;
  onChange: (filters: MealFilters) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SelectField
        label="Diet type"
        placeholder="Any"
        options={DIET_TYPE_OPTIONS}
        value={filters.dietType ?? ""}
        onChange={(event) =>
          onChange({ ...filters, dietType: event.target.value || undefined })
        }
      />
      <InputField
        label="Max calories"
        type="number"
        placeholder="e.g. 500"
        value={filters.maxCalories ?? ""}
        onChange={(event) =>
          onChange({
            ...filters,
            maxCalories: event.target.value ? Number(event.target.value) : undefined
          })
        }
      />
      <label className="flex items-end gap-2 pb-2.5 text-sm text-text-primary">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border"
          checked={filters.allergySafeOnly ?? false}
          onChange={(event) => onChange({ ...filters, allergySafeOnly: event.target.checked })}
        />
        Allergy-safe only
      </label>
    </div>
  );
}
