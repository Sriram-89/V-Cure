import type { ShoppingAdapter } from "@/lib/shopping-adapter/types";
import { mockShoppingAdapter } from "@/lib/shopping-adapter/mock-adapter";

// TODO(backend): once /shopping/* endpoints exist in 05_API_CONTRACTS.md,
// implement a RealShoppingAdapter against apiClient and swap it in here.
// No component or hook in src/components/shopping or src/hooks/use-shopping.ts
// should need to change.
export const shoppingAdapter: ShoppingAdapter = mockShoppingAdapter;

export type { ShoppingAdapter } from "@/lib/shopping-adapter/types";
