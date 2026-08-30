"use client";

import { Wallet } from "lucide-react";
import { useBudget } from "@/hooks/use-shopping";
import { useShoppingCartStore } from "@/store/shopping-cart-store";
import { computeCartTotals } from "@/lib/cart-totals";
import { cn } from "@/lib/cn";

export function BudgetTracker() {
  const { data: budget, isLoading, isError } = useBudget();
  const items = useShoppingCartStore((state) => state.items);
  const { totalCost } = computeCartTotals(items);

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-card bg-surface-muted" />;
  }

  if (isError || !budget) {
    return <p className="text-sm text-danger">Couldn&apos;t load your budget.</p>;
  }

  const projectedSpend = budget.spentThisMonthInr + totalCost;
  const remaining = budget.monthlyLimitInr - projectedSpend;
  const percent = Math.min(100, Math.round((projectedSpend / budget.monthlyLimitInr) * 100));
  const isOverBudget = remaining < 0;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Wallet className="h-4 w-4" aria-hidden="true" />
        Monthly budget
      </h2>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-text-secondary">Spent + cart</span>
        <span className="font-medium text-text-primary">
          ₹{projectedSpend} / ₹{budget.monthlyLimitInr}
        </span>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className={cn("h-full rounded-full transition-all", isOverBudget ? "bg-danger" : "bg-primary")}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <p className={cn("mt-2 text-xs", isOverBudget ? "text-danger" : "text-text-secondary")}>
        {isOverBudget
          ? `₹${Math.abs(remaining)} over budget if you check out now`
          : `₹${remaining} remaining this month`}
      </p>
    </div>
  );
}
