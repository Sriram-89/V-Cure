import { PackageSearch, AlertCircle } from "lucide-react";
import { ProductCard } from "@/components/shopping/product-card";
import type { ProductSummary } from "@/types/shopping";

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-card bg-surface-muted" />
      ))}
    </div>
  );
}

export function ProductGrid({
  products,
  isLoading,
  isError,
  emptyLabel,
  onToggleFavorite
}: {
  products: ProductSummary[] | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyLabel: string;
  onToggleFavorite: (productId: string) => void;
}) {
  if (isLoading) return <ProductGridSkeleton />;

  if (isError || !products) {
    return (
      <div className="flex items-center gap-2 text-sm text-danger">
        <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        Couldn&apos;t load products.
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-border py-10 text-center">
        <PackageSearch className="h-6 w-6 text-text-secondary" aria-hidden="true" />
        <p className="text-sm text-text-secondary">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  );
}
