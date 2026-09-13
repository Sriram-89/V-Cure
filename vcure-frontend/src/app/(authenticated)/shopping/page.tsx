"use client";

import Link from "next/link";
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
    <div className="min-h-screen bg-gray-50 pb-8 min-w-0 w-full">
      <Container className="max-w-md px-4 py-6 space-y-5 min-w-0 w-full">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Shopping</h1>
            <p className="mt-0.5 text-xs font-medium text-gray-500">
              Build your list, stay on budget, and check out when ready.
            </p>
          </div>
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white shrink-0 shadow-xs hover:bg-slate-700 transition-all"
            aria-label="Profile"
          >
            S
          </Link>
        </div>

        {/* Category Pills */}
        <GroceryCategories activeCategory={activeCategory} onSelect={setActiveCategory} />

        {/* Search & Filters */}
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-md">
          <ProductSearchFilters filters={filters} onChange={setFilters} />
        </div>

        {/* Product Grid / Recommendations */}
        {showFilteredGrid ? (
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-700">
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
        <ShoppingCartPanel />
        <BudgetTracker />
        <StoreSelector />
        <CheckoutPreparation />
      </Container>
    </div>
  );
}
