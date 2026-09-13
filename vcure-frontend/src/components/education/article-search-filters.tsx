"use client";

import { Search } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import type { ArticleFilters } from "@/types/education";

const DIFFICULTY_OPTIONS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" }
];

export function ArticleSearchFilters({
  filters,
  onChange
}: {
  filters: ArticleFilters;
  onChange: (filters: ArticleFilters) => void;
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
          placeholder="Search articles"
          aria-label="Search articles"
          className="h-11 w-full rounded-input border border-border bg-surface pl-9 pr-3 text-sm text-text-primary focus-visible:border-primary"
        />
      </div>

      <div className="max-w-xs">
        <SelectField
          label="Difficulty"
          placeholder="Any"
          options={DIFFICULTY_OPTIONS}
          value={filters.difficulty ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              difficulty: (event.target.value || undefined) as ArticleFilters["difficulty"]
            })
          }
        />
      </div>
    </div>
  );
}
