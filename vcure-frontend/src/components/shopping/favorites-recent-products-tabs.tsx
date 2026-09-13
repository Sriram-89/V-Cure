"use client";

import { useState } from "react";
import { Heart, History } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProductGrid } from "@/components/shopping/product-grid";
import { useFavoriteProducts, useRecentlyPurchased, useToggleFavoriteProduct } from "@/hooks/use-shopping";

export function FavoritesRecentProductsTabs() {
  const [tab, setTab] = useState<"favorites" | "recent">("favorites");
  const favorites = useFavoriteProducts();
  const recent = useRecentlyPurchased();
  const toggleFavorite = useToggleFavoriteProduct();

  const active = tab === "favorites" ? favorites : recent;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div role="tablist" className="flex gap-1 rounded-md bg-surface-muted p-1">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "favorites"}
          onClick={() => setTab("favorites")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium",
            tab === "favorites" ? "bg-surface text-primary shadow-card" : "text-text-secondary"
          )}
        >
          <Heart className="h-3.5 w-3.5" aria-hidden="true" />
          Favorites
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "recent"}
          onClick={() => setTab("recent")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium",
            tab === "recent" ? "bg-surface text-primary shadow-card" : "text-text-secondary"
          )}
        >
          <History className="h-3.5 w-3.5" aria-hidden="true" />
          Recently purchased
        </button>
      </div>

      <div className="mt-4">
        <ProductGrid
          products={active.data}
          isLoading={active.isLoading}
          isError={active.isError}
          emptyLabel={
            tab === "favorites"
              ? "Products you save will show up here."
              : "Products you buy will show up here."
          }
          onToggleFavorite={(id) => toggleFavorite.mutate(id)}
        />
      </div>
    </div>
  );
}
