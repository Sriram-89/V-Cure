"use client";

import { ShoppingCart, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/shopping/quantity-selector";
import { useShoppingCartStore } from "@/store/shopping-cart-store";
import { computeCartTotals } from "@/lib/cart-totals";

export function ShoppingCartPanel() {
  const items = useShoppingCartStore((state) => state.items);
  const toggleItem = useShoppingCartStore((state) => state.toggleItem);
  const removeItem = useShoppingCartStore((state) => state.removeItem);
  const updateQuantity = useShoppingCartStore((state) => state.updateQuantity);
  const clear = useShoppingCartStore((state) => state.clear);

  const totals = computeCartTotals(items);

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          Cart ({items.length})
        </h2>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={clear}
            className="text-xs font-medium text-text-secondary hover:text-danger"
          >
            Clear cart
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-4 py-4 text-sm text-text-secondary">
          Your cart is empty. Add products or ingredients to get started.
        </p>
      ) : (
        <>
          <ul className="mt-4 flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id} className="rounded-md bg-surface-muted p-3">
                <div className="flex items-start justify-between gap-2">
                  <label className="flex flex-1 items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-border"
                      checked={item.isChecked}
                      onChange={() => toggleItem(item.id)}
                    />
                    <span className={item.isChecked ? "text-text-secondary line-through" : "text-text-primary"}>
                      {item.name}
                      {item.estimatedCost ? ` · ₹${item.estimatedCost}` : ""}
                    </span>
                  </label>
                  <button
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 rounded-md p-1 text-text-secondary hover:bg-surface hover:text-danger"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                {item.unitCount !== undefined && item.unit ? (
                  <div className="mt-2">
                    <QuantitySelector
                      value={item.unitCount}
                      unit={item.unit}
                      onChange={(value) => updateQuantity(item.id, value)}
                      min={1}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm font-semibold text-text-primary">
              <span>Total</span>
              <span>₹{totals.totalCost}</span>
            </div>
            {totals.itemsWithNutritionCount > 0 ? (
              <dl className="mt-3 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
                <div className="rounded-md bg-surface-muted p-2">
                  <dt className="text-text-secondary">Calories</dt>
                  <dd className="font-semibold text-text-primary">{Math.round(totals.totalCalories)}</dd>
                </div>
                <div className="rounded-md bg-surface-muted p-2">
                  <dt className="text-text-secondary">Protein</dt>
                  <dd className="font-semibold text-text-primary">{Math.round(totals.totalProteinG)}g</dd>
                </div>
                <div className="rounded-md bg-surface-muted p-2">
                  <dt className="text-text-secondary">Carbs</dt>
                  <dd className="font-semibold text-text-primary">{Math.round(totals.totalCarbsG)}g</dd>
                </div>
                <div className="rounded-md bg-surface-muted p-2">
                  <dt className="text-text-secondary">Fat</dt>
                  <dd className="font-semibold text-text-primary">{Math.round(totals.totalFatG)}g</dd>
                </div>
              </dl>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
