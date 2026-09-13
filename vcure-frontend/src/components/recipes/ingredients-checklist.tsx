"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShoppingCartStore } from "@/store/shopping-cart-store";
import type { RecipeIngredient } from "@/types/recipes";

export function IngredientsChecklist({
  ingredients,
  recipeId
}: {
  ingredients: RecipeIngredient[];
  recipeId: string;
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const addItems = useShoppingCartStore((state) => state.addItems);
  const [justAdded, setJustAdded] = useState(false);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddToCart = () => {
    addItems(
      ingredients.map((ingredient) => ({
        id: `${recipeId}-${ingredient.id}`,
        name: ingredient.name,
        quantity: ingredient.quantity,
        sourceRecipeId: recipeId
      }))
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  if (ingredients.length === 0) {
    return <p className="text-sm text-text-secondary">No ingredients listed for this recipe.</p>;
  }

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {ingredients.map((ingredient) => (
          <li key={ingredient.id}>
            <label className="flex items-center gap-2 text-sm text-text-primary">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={checked.has(ingredient.id)}
                onChange={() => toggle(ingredient.id)}
              />
              <span className={checked.has(ingredient.id) ? "text-text-secondary line-through" : ""}>
                {ingredient.name} — {ingredient.quantity}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={handleAddToCart}>
        {justAdded ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Added to cart
          </>
        ) : (
          <>
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
            Add all to shopping list
          </>
        )}
      </Button>
    </div>
  );
}
