import { ProductGrid } from "@/components/shopping/product-grid";
import { useHealthyAlternatives, useToggleFavoriteProduct } from "@/hooks/use-shopping";

export function HealthyAlternatives({ productId }: { productId: string }) {
  const { data, isLoading, isError } = useHealthyAlternatives(productId);
  const toggleFavorite = useToggleFavoriteProduct();

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-text-primary">Healthy alternatives</h2>
      <ProductGrid
        products={data}
        isLoading={isLoading}
        isError={isError}
        emptyLabel="No alternatives suggested for this product."
        onToggleFavorite={(id) => toggleFavorite.mutate(id)}
      />
    </div>
  );
}
