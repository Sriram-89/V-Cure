"use client";

import { Search } from "lucide-react";
import { SelectField } from "@/components/ui/select-field";
import { InputField } from "@/components/ui/input-field";
import type { ProductFilters } from "@/types/shopping";

export function ProductSearchFilters({
  filters,
  onChange
}: {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
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
          placeholder="Search products"
          aria-label="Search products"
          className="h-11 w-full rounded-input border border-border bg-surface pl-9 pr-3 text-sm text-text-primary focus-visible:border-primary"
        />
      </div>

      <div className="flex flex-col gap-3 min-w-0 w-full">
        <InputField
          label="Max price (₹)"
          type="number"
          placeholder="e.g. 200"
          value={filters.maxPrice ?? ""}
          onChange={(event) =>
            onChange({ ...filters, maxPrice: event.target.value ? Number(event.target.value) : undefined })
          }
        />
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            checked={filters.availableOnly ?? false}
            onChange={(event) => onChange({ ...filters, availableOnly: event.target.checked })}
          />
          In stock only
        </label>
      </div>
    </div>
  );
}
