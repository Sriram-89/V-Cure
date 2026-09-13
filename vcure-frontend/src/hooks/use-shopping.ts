import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shoppingService } from "@/services/shopping-service";
import type { GroceryCategory, ProductFilters } from "@/types/shopping";

export function useGroceryCategories() {
  return useQuery({ queryKey: ["shopping", "categories"], queryFn: shoppingService.getCategories });
}

export function useRecommendedProducts() {
  return useQuery({ queryKey: ["shopping", "recommended"], queryFn: shoppingService.getRecommended });
}

export function useProductsByCategory(category: GroceryCategory | null) {
  return useQuery({
    queryKey: ["shopping", "category", category],
    queryFn: () => shoppingService.getByCategory(category as GroceryCategory),
    enabled: Boolean(category)
  });
}

export function useProductSearch(filters: ProductFilters) {
  return useQuery({ queryKey: ["shopping", "search", filters], queryFn: () => shoppingService.search(filters) });
}

export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: ["shopping", "detail", productId],
    queryFn: () => shoppingService.getDetail(productId)
  });
}

export function useHealthyAlternatives(productId: string) {
  return useQuery({
    queryKey: ["shopping", "alternatives", productId],
    queryFn: () => shoppingService.getAlternatives(productId)
  });
}

export function useFavoriteProducts() {
  return useQuery({ queryKey: ["shopping", "favorites"], queryFn: shoppingService.getFavorites });
}

export function useRecentlyPurchased() {
  return useQuery({ queryKey: ["shopping", "recent"], queryFn: shoppingService.getRecentlyPurchased });
}

export function useStores() {
  return useQuery({ queryKey: ["shopping", "stores"], queryFn: shoppingService.getStores });
}

export function useBudget() {
  return useQuery({ queryKey: ["shopping", "budget"], queryFn: shoppingService.getBudget });
}

export function useToggleFavoriteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => shoppingService.toggleFavorite(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shopping"] })
  });
}

export function useGenerateAiShoppingList() {
  return useMutation({ mutationFn: () => shoppingService.generateAiList() });
}

export function useLogPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (totalInr: number) => shoppingService.logPurchase(totalInr),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["shopping", "budget"] })
  });
}

export function useBarcodeLookup() {
  return useMutation({ mutationFn: (barcode: string) => shoppingService.lookupByBarcode(barcode) });
}
