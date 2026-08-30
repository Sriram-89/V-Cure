"use client";

import { Search } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import { InputField } from "@/components/ui/input-field";
import type { RecipeFilters } from "@/types/recipes";

const DIFFICULTY_OPTIONS = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" }
];

const DIET_TAG_OPTIONS = [
  { value: "Vegetarian", label: "Vegetarian" },
  { value: "Vegan", label: "Vegan" },
  { value: "High Protein", label: "High Protein" },
  { value: "Low Carb", label: "Low Carb" },
  { value: "Gluten Free", label: "Gluten Free" }
];

export function RecipeSearchFilters({
  filters,
  onChange
}: {
  filters: RecipeFilters;
  onChange: (filters: RecipeFilters) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
          aria-hidden="true"
        />
        <input
          type="search"
          value={filters.query ?? ""}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search recipes"
          aria-label="Search recipes"
          className="h-11 w-full rounded-input border border-border bg-surface pl-9 pr-3 text-sm text-text-primary focus-visible:border-primary"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SelectField
          label="Difficulty"
          placeholder="Any"
          options={DIFFICULTY_OPTIONS}
          value={filters.difficulty ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              difficulty: (event.target.value || undefined) as RecipeFilters["difficulty"]
            })
          }
        />
        <SelectField
          label="Diet"
          placeholder="Any"
          options={DIET_TAG_OPTIONS}
          value={filters.dietTag ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              dietTag: (event.target.value || undefined) as RecipeFilters["dietTag"]
            })
          }
        />
        <InputField
          label="Max cooking time (min)"
          type="number"
          placeholder="e.g. 30"
          value={filters.maxCookingTimeMinutes ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              maxCookingTimeMinutes: event.target.value ? Number(event.target.value) : undefined
            })
          }
        />
      </div>
    </div>
  );
}
