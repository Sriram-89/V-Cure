"use client";

import { useState } from "react";
import { Sparkles, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { useGenerateAiShoppingList } from "@/hooks/use-shopping";
import { useShoppingCartStore } from "@/store/shopping-cart-store";

export function ShoppingListSection() {
  const generateAiList = useGenerateAiShoppingList();
  const addItems = useShoppingCartStore((state) => state.addItems);
  const [manualItem, setManualItem] = useState("");
  const [justGenerated, setJustGenerated] = useState(false);

  const handleGenerate = () => {
    generateAiList.mutate(undefined, {
      onSuccess: (items) => {
        addItems(
          items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: `${item.quantity} × ${item.unit}`,
            unitCount: item.quantity,
            unit: item.unit,
            estimatedCost: item.estimatedCost,
            category: item.category
          }))
        );
        setJustGenerated(true);
        setTimeout(() => setJustGenerated(false), 2000);
      }
    });
  };

  const handleAddManual = () => {
    const trimmed = manualItem.trim();
    if (!trimmed) return;
    addItems([{ id: `manual-${Date.now()}`, name: trimmed, quantity: "1" }]);
    setManualItem("");
  };

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-text-primary">Shopping list</h2>
      <p className="mt-1 text-xs text-text-secondary">
        Generate a list from your active meal plan, or add items yourself. Ingredients added
        from a recipe show up in your cart automatically.
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={handleGenerate}
        isLoading={generateAiList.isPending}
      >
        {justGenerated ? (
          <>
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            Added to cart
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Generate from meal plan
          </>
        )}
      </Button>

      <div className="mt-4 flex items-end gap-2">
        <div className="flex-1">
          <InputField
            label="Add item manually"
            placeholder="e.g. Olive oil"
            value={manualItem}
            onChange={(event) => setManualItem(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddManual();
              }
            }}
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddManual}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add
        </Button>
      </div>
    </div>
  );
}
