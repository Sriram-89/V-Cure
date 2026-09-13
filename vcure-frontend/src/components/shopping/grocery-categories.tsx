"use client";

import { cn } from "@/lib/cn";
import { useGroceryCategories } from "@/hooks/use-shopping";
import type { GroceryCategory } from "@/types/shopping";

export function GroceryCategories({
  activeCategory,
  onSelect
}: {
  activeCategory: GroceryCategory | null;
  onSelect: (category: GroceryCategory | null) => void;
}) {
  const { data, isLoading } = useGroceryCategories();

  if (isLoading || !data) {
    return <div className="h-9 w-full animate-pulse rounded-full bg-surface-muted" />;
  }

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2 shrink-0 w-max" role="tablist" aria-label="Grocery categories">
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === null}
          onClick={() => onSelect(null)}
          className={cn(
            "shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-xs",
            activeCategory === null && "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
          )}
        >
          All
        </button>
        {data.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={activeCategory === category}
            onClick={() => onSelect(category)}
            className={cn(
              "shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-xs",
              activeCategory === category && "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
