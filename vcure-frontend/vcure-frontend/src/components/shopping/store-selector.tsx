"use client";

import { Store, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStores } from "@/hooks/use-shopping";
import { useShoppingStore } from "@/store/shopping-store";

export function StoreSelector() {
  const { data, isLoading, isError } = useStores();
  const selectedStoreId = useShoppingStore((state) => state.selectedStoreId);
  const setSelectedStoreId = useShoppingStore((state) => state.setSelectedStoreId);

  if (isLoading) return <div className="h-20 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load stores.</p>;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Store className="h-4 w-4" aria-hidden="true" />
        Choose a store
      </h2>
      <div className="mt-3 flex flex-col gap-2" role="radiogroup" aria-label="Store">
        {data.map((store) => {
          const isSelected = selectedStoreId === store.id;
          return (
            <button
              key={store.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelectedStoreId(store.id)}
              className={cn(
                "flex items-center justify-between rounded-md border border-border px-4 py-3 text-left text-sm",
                isSelected && "border-primary bg-primary-50"
              )}
            >
              <span className="font-medium text-text-primary">{store.name}</span>
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {store.distanceKm} km
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
