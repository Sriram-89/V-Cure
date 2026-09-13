import type {
  BudgetDto,
  GroceryCategory,
  ProductDetail,
  ProductFilters,
  ProductSummary,
  ShoppingListItem,
  StoreDto
} from "@/types/shopping";

export interface ShoppingAdapter {
  getCategories(): Promise<GroceryCategory[]>;
  getRecommendedProducts(): Promise<ProductSummary[]>;
  getProductsByCategory(category: GroceryCategory): Promise<ProductSummary[]>;
  searchProducts(filters: ProductFilters): Promise<ProductSummary[]>;
  getProductDetail(productId: string): Promise<ProductDetail>;
  getHealthyAlternatives(productId: string): Promise<ProductSummary[]>;
  toggleFavoriteProduct(productId: string): Promise<{ isFavorite: boolean }>;
  getFavoriteProducts(): Promise<ProductSummary[]>;
  getRecentlyPurchased(): Promise<ProductSummary[]>;
  getStores(): Promise<StoreDto[]>;
  generateAiShoppingList(): Promise<ShoppingListItem[]>;
  getBudget(): Promise<BudgetDto>;
  logPurchase(totalInr: number): Promise<BudgetDto>;
  lookupByBarcode(barcode: string): Promise<ProductDetail | null>;
}
