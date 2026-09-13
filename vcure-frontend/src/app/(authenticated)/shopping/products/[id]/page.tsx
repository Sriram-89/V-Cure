"use client";

import { use } from "react";
import { Heart, Flame, AlertCircle, ShoppingCart } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { AvailabilityBadge } from "@/components/shopping/availability-badge";
import { QuantitySelector } from "@/components/shopping/quantity-selector";
import { HealthyAlternatives } from "@/components/shopping/healthy-alternatives";
import { NutritionComparison } from "@/components/shopping/nutrition-comparison";
import { MacroDistributionChart } from "@/components/meals/macro-distribution-chart";
import { MicronutrientsList } from "@/components/meals/micronutrients-list";
import { cn } from "@/lib/cn";
import { useState } from "react";
import {
  useProductDetail,
  useHealthyAlternatives,
  useToggleFavoriteProduct
} from "@/hooks/use-shopping";
import { useShoppingCartStore } from "@/store/shopping-cart-store";

export default function ProductDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: product, isLoading, isError } = useProductDetail(id);
  const alternatives = useHealthyAlternatives(id);
  const toggleFavorite = useToggleFavoriteProduct();
  const addItems = useShoppingCartStore((state) => state.addItems);
  const [quantity, setQuantity] = useState(1);

  if (isLoading) {
    return (
      <Container className="max-w-3xl py-8">
        <div className="h-8 w-2/3 animate-pulse rounded bg-surface-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-card bg-surface-muted" />
      </Container>
    );
  }

  if (isError || !product) {
    return (
      <Container className="max-w-3xl py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <AlertCircle className="h-8 w-8 text-danger" aria-hidden="true" />
          <p className="text-sm text-text-secondary">Couldn&apos;t load this product.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="max-w-3xl py-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-text-secondary">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-semibold text-text-primary">{product.name}</h1>
        </div>
        <button
          type="button"
          aria-label={product.isFavorite ? "Remove from favorites" : "Save product"}
          aria-pressed={product.isFavorite}
          onClick={() => toggleFavorite.mutate(product.id)}
          className="rounded-full p-2 hover:bg-surface-muted"
        >
          <Heart
            className={cn("h-5 w-5", product.isFavorite ? "fill-danger text-danger" : "text-text-secondary")}
            aria-hidden="true"
          />
        </button>
      </div>

      <p className="mt-2 text-sm text-text-secondary">{product.description}</p>

      <div className="mt-3 flex items-center gap-3">
        <AvailabilityBadge availability={product.availability} />
        <span className="flex items-center gap-1 text-sm text-text-secondary">
          <Flame className="h-4 w-4" aria-hidden="true" />
          {product.nutrition.calories} kcal per {product.unit}
        </span>
      </div>

      {product.availability !== "OUT_OF_STOCK" ? (
        <div className="mt-4 flex items-center gap-3">
          <QuantitySelector value={quantity} unit="" onChange={setQuantity} min={1} />
          <Button
            type="button"
            size="sm"
            onClick={() =>
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
              ])
            }
          >
            <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" />
            Add to cart — ₹{product.pricePerUnit * quantity}
          </Button>
        </div>
      ) : null}

      <div className="mt-8 rounded-card border border-border p-4">
        <h2 className="text-sm font-semibold text-text-primary">Nutrition facts</h2>
        <MacroDistributionChart macros={product.nutrition.macros} />
        <MicronutrientsList micronutrients={product.nutrition.micronutrients} />
      </div>

      {alternatives.data && alternatives.data.length > 0 && alternatives.data[0] ? (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-text-primary">Nutrition comparison</h2>
          <NutritionComparison product={product} alternative={alternatives.data[0]} />
        </div>
      ) : null}

      <div className="mt-8">
        <HealthyAlternatives productId={product.id} />
      </div>
    </Container>
  );
}
