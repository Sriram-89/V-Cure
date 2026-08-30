import { ProductGrid } from "@/components/shopping/product-grid";
import { useRecommendedProducts, useToggleFavoriteProduct } from "@/hooks/use-shopping";

export function RecommendedProductsSection() {
  const { data, isLoading, isError } = useRecommendedProducts();
  const toggleFavorite = useToggleFavoriteProduct();

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-text-primary">Recommended for you</h2>
      <ProductGrid
        products={data}
        isLoading={isLoading}
        isError={isError}
        emptyLabel="No recommendations available right now."
        onToggleFavorite={(id) => toggleFavorite.mutate(id)}
      />
    </div>
  );
}
