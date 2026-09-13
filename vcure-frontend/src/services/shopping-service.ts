import { shoppingAdapter } from "@/lib/shopping-adapter";
import type { GroceryCategory, ProductFilters } from "@/types/shopping";

export const shoppingService = {
  getCategories: () => shoppingAdapter.getCategories(),
  getRecommended: () => shoppingAdapter.getRecommendedProducts(),
  getByCategory: (category: GroceryCategory) => shoppingAdapter.getProductsByCategory(category),
  search: (filters: ProductFilters) => shoppingAdapter.searchProducts(filters),
  getDetail: (productId: string) => shoppingAdapter.getProductDetail(productId),
  getAlternatives: (productId: string) => shoppingAdapter.getHealthyAlternatives(productId),
  toggleFavorite: (productId: string) => shoppingAdapter.toggleFavoriteProduct(productId),
  getFavorites: () => shoppingAdapter.getFavoriteProducts(),
  getRecentlyPurchased: () => shoppingAdapter.getRecentlyPurchased(),
  getStores: () => shoppingAdapter.getStores(),
  generateAiList: () => shoppingAdapter.generateAiShoppingList(),
  getBudget: () => shoppingAdapter.getBudget(),
  logPurchase: (totalInr: number) => shoppingAdapter.logPurchase(totalInr),
  lookupByBarcode: (barcode: string) => shoppingAdapter.lookupByBarcode(barcode)
};
