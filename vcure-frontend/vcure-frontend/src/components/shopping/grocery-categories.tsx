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
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Grocery categories">
      <button
        type="button"
        role="tab"
        aria-selected={activeCategory === null}
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium",
          activeCategory === null && "border-primary bg-primary-50 text-primary-700"
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
            "shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium",
            activeCategory === category && "border-primary bg-primary-50 text-primary-700"
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
