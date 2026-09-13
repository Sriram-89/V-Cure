import type { ShoppingAdapter } from "@/lib/shopping-adapter/types";
import { MOCK_PRODUCTS, MOCK_STORES, toProductSummary } from "@/lib/shopping-adapter/mock-data";
import type {
  BudgetDto,
  GroceryCategory,
  ProductDetail,
  ProductFilters,
  ShoppingListItem
} from "@/types/shopping";

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

let products: ProductDetail[] = MOCK_PRODUCTS.map((product) => ({ ...product }));
const recentlyPurchasedIds: string[] = ["product-greek-yogurt", "product-spinach"];
let budget: BudgetDto = { monthlyLimitInr: 8000, spentThisMonthInr: 3200 };

function findProduct(id: string): ProductDetail {
  const product = products.find((p) => p.id === id);
  if (!product) throw new Error(`Product ${id} not found`);
  return product;
}

export const mockShoppingAdapter: ShoppingAdapter = {
  async getCategories(): Promise<GroceryCategory[]> {
    return delay(["Produce", "Dairy", "Grains", "Protein", "Snacks", "Beverages", "Pantry"]);
  },

  async getRecommendedProducts() {
    return delay(products.map(toProductSummary));
  },

  async getProductsByCategory(category: GroceryCategory) {
    return delay(products.filter((p) => p.category === category).map(toProductSummary));
  },

  async searchProducts(filters: ProductFilters) {
    let results = products;
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(query));
    }
    if (filters.category) {
      results = results.filter((p) => p.category === filters.category);
    }
    if (filters.availableOnly) {
      results = results.filter((p) => p.availability !== "OUT_OF_STOCK");
    }
    if (filters.maxPrice) {
      results = results.filter((p) => p.pricePerUnit <= filters.maxPrice!);
    }
    return delay(results.map(toProductSummary));
  },

  async getProductDetail(productId: string) {
    return delay({ ...findProduct(productId) });
  },

  async getHealthyAlternatives(productId: string) {
    const product = findProduct(productId);
    return delay(
      product.healthyAlternativeIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is ProductDetail => Boolean(p))
        .map(toProductSummary)
    );
  },

  async toggleFavoriteProduct(productId: string) {
    const product = findProduct(productId);
    product.isFavorite = !product.isFavorite;
    return delay({ isFavorite: product.isFavorite });
  },

  async getFavoriteProducts() {
    return delay(products.filter((p) => p.isFavorite).map(toProductSummary));
  },

  async getRecentlyPurchased() {
    return delay(
      recentlyPurchasedIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p): p is ProductDetail => Boolean(p))
        .map(toProductSummary)
    );
  },

  async getStores() {
    return delay(MOCK_STORES);
  },

  async generateAiShoppingList(): Promise<ShoppingListItem[]> {
    // Derived from the active meal plan in a real backend; mocked here
    // from a representative subset of products.
    const seedIds = ["product-spinach", "product-chicken-breast", "product-quinoa", "product-greek-yogurt"];
    const items: ShoppingListItem[] = seedIds.map((id) => {
      const product = findProduct(id);
      return {
        id: `ai-${product.id}`,
        name: product.name,
        quantity: 1,
        unit: product.unit,
        estimatedCost: product.pricePerUnit,
        category: product.category,
        isChecked: false
      };
    });
    return delay(items);
  },

  async getBudget() {
    return delay(budget);
  },

  async logPurchase(totalInr: number) {
    budget = { ...budget, spentThisMonthInr: budget.spentThisMonthInr + totalInr };
    return delay(budget);
  },

  async lookupByBarcode(barcode: string) {
    // Mock: deterministic lookup keyed off the barcode's last digit.
    const index = Number(barcode.slice(-1)) % products.length;
    return delay(products[index] ? { ...products[index] } : null);
  }
};
