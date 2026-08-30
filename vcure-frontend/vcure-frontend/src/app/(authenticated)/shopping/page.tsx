"use client";

import { Container } from "@/components/ui/container";
import { GroceryCategories } from "@/components/shopping/grocery-categories";
import { ProductSearchFilters } from "@/components/shopping/product-search-filters";
import { ProductGrid } from "@/components/shopping/product-grid";
import { ShoppingCartPanel } from "@/components/shopping/shopping-cart-panel";
import { ShoppingListSection } from "@/components/shopping/shopping-list-section";
import { BudgetTracker } from "@/components/shopping/budget-tracker";
import { RecommendedProductsSection } from "@/components/shopping/recommended-products-section";
import { FavoritesRecentProductsTabs } from "@/components/shopping/favorites-recent-products-tabs";
import { StoreSelector } from "@/components/shopping/store-selector";
import { BarcodeScannerUI } from "@/components/shopping/barcode-scanner-ui";
import { CheckoutPreparation } from "@/components/shopping/checkout-preparation";
import {
  useProductsByCategory,
  useProductSearch,
  useToggleFavoriteProduct
} from "@/hooks/use-shopping";
import { useShoppingStore } from "@/store/shopping-store";

export default function ShoppingHomePage() {
  const activeCategory = useShoppingStore((state) => state.activeCategory);
  const setActiveCategory = useShoppingStore((state) => state.setActiveCategory);
  const filters = useShoppingStore((state) => state.filters);
  const setFilters = useShoppingStore((state) => state.setFilters);
  const toggleFavorite = useToggleFavoriteProduct();

  const hasActiveFilters = Boolean(filters.query || filters.availableOnly || filters.maxPrice);
  const byCategory = useProductsByCategory(activeCategory);
  const searchResults = useProductSearch(filters);

  const showFilteredGrid = hasActiveFilters || activeCategory !== null;
  const filteredList = hasActiveFilters ? searchResults : byCategory;

  return (
    <Container className="max-w-5xl py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Shopping</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Build your list, stay on budget, and check out when you&apos;re ready.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <GroceryCategories activeCategory={activeCategory} onSelect={setActiveCategory} />

          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <ProductSearchFilters filters={filters} onChange={setFilters} />
          </div>

          {showFilteredGrid ? (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-text-primary">
                {hasActiveFilters ? "Search results" : activeCategory}
              </h2>
              <ProductGrid
                products={filteredList.data}
                isLoading={filteredList.isLoading}
                isError={filteredList.isError}
                emptyLabel="No products match right now."
                onToggleFavorite={(id) => toggleFavorite.mutate(id)}
              />
            </div>
          ) : (
            <RecommendedProductsSection />
          )}

          <ShoppingListSection />
          <BarcodeScannerUI />
          <FavoritesRecentProductsTabs />
        </div>

        <div className="flex flex-col gap-6">
          <ShoppingCartPanel />
          <BudgetTracker />
          <StoreSelector />
          <CheckoutPreparation />
        </div>
      </div>
    </Container>
  );
}
