"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Check, ShoppingCart } from "lucide-react";
import { AvailabilityBadge } from "@/components/shopping/availability-badge";
import { QuantitySelector } from "@/components/shopping/quantity-selector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/constants/routes";
import { useShoppingCartStore } from "@/store/shopping-cart-store";
import type { ProductSummary } from "@/types/shopping";

export function ProductCard({
  product,
  onToggleFavorite
}: {
  product: ProductSummary;
  onToggleFavorite: (productId: string) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addItems = useShoppingCartStore((state) => state.addItems);

  const handleAddToCart = () => {
    addItems([
      {
        id: product.id,
        name: product.name,
        quantity: `${quantity} × ${product.unit}`,
        unitCount: quantity,
        unit: product.unit,
        estimatedCost: product.pricePerUnit * quantity,
        category: product.category,
        nutritionPerUnit: product.nutrition
      }
    ]);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`${ROUTES.SHOPPING}/products/${product.id}`}
          className="min-w-0 flex-1 text-sm font-semibold text-text-primary hover:text-primary"
        >
          {product.name}
        </Link>
        <button
          type="button"
          aria-label={product.isFavorite ? "Remove from favorites" : "Save product"}
          aria-pressed={product.isFavorite}
          onClick={() => onToggleFavorite(product.id)}
          className="shrink-0 rounded-full p-1.5 hover:bg-surface-muted"
        >
          <Heart
            className={cn("h-4 w-4", product.isFavorite ? "fill-danger text-danger" : "text-text-secondary")}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="flex items-center justify-between text-sm text-text-secondary">
        <span>{product.unit}</span>
        <span className="font-semibold text-text-primary">₹{product.pricePerUnit}</span>
      </div>

      <AvailabilityBadge availability={product.availability} />

      {product.availability !== "OUT_OF_STOCK" ? (
        <>
          <QuantitySelector value={quantity} unit="" onChange={setQuantity} min={1} />
          <Button type="button" variant="outline" size="sm" onClick={handleAddToCart}>
            {justAdded ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Added
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
                Add to cart
              </>
            )}
          </Button>
        </>
      ) : null}
    </div>
  );
}
