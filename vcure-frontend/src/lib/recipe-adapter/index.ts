import type { RecipeAdapter } from "@/lib/recipe-adapter/types";
import { mockRecipeAdapter } from "@/lib/recipe-adapter/mock-adapter";

// TODO(backend): once /recipes/* endpoints exist in 05_API_CONTRACTS.md,
// implement a RealRecipeAdapter against apiClient and swap it in here.
// No component or hook in src/components/recipes or src/hooks/use-recipes.ts
// should need to change.
export const recipeAdapter: RecipeAdapter = mockRecipeAdapter;

export type { RecipeAdapter } from "@/lib/recipe-adapter/types";
