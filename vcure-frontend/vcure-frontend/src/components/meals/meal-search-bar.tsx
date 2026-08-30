"use client";

import { Search } from "lucide-react";

export function MealSearchBar({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search meals"
        aria-label="Search meals"
        className="h-11 w-full rounded-input border border-border bg-surface pl-9 pr-3 text-sm text-text-primary focus-visible:border-primary"
      />
    </div>
  );
}
