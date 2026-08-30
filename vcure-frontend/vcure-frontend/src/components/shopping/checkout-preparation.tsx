"use client";

import { AlertCircle, CheckCircle2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShoppingCartStore } from "@/store/shopping-cart-store";
import { useShoppingStore } from "@/store/shopping-store";
import { useStores, useLogPurchase } from "@/hooks/use-shopping";
import { computeCartTotals } from "@/lib/cart-totals";

export function CheckoutPreparation() {
  const items = useShoppingCartStore((state) => state.items);
  const clearCart = useShoppingCartStore((state) => state.clear);
  const selectedStoreId = useShoppingStore((state) => state.selectedStoreId);
  const { data: stores } = useStores();
  const logPurchase = useLogPurchase();

  const totals = computeCartTotals(items);
  const store = stores?.find((s) => s.id === selectedStoreId);

  const handleCheckout = () => {
    logPurchase.mutate(totals.totalCost, { onSuccess: () => clearCart() });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
        Ready to check out
      </h2>

      <dl className="mt-3 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-text-secondary">Items</dt>
          <dd className="text-text-primary">{items.length}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-secondary">Store</dt>
          <dd className="text-text-primary">{store?.name ?? "Not selected"}</dd>
        </div>
        <div className="flex justify-between font-semibold">
          <dt className="text-text-primary">Estimated total</dt>
          <dd className="text-text-primary">₹{totals.totalCost}</dd>
        </div>
      </dl>

      {!store ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-warning">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Select a store above before checking out.
        </div>
      ) : null}

      {logPurchase.isSuccess ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          Purchase logged and added to your budget.
        </div>
      ) : (
        <Button
          type="button"
          className="mt-4 w-full"
          disabled={!store}
          onClick={handleCheckout}
          isLoading={logPurchase.isPending}
        >
          Prepare checkout
        </Button>
      )}
    </div>
  );
}
