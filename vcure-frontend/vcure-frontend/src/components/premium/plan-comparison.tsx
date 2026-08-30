"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLANS } from "@/constants/plans";
import { useSubscription } from "@/hooks/use-premium";
import { cn } from "@/lib/cn";
import type { PlanCode } from "@/constants/plans";

export function PlanComparison({ onSelectPlan }: { onSelectPlan: (planCode: PlanCode) => void }) {
  const { data } = useSubscription();
  const activePlanCode = data?.status === "ACTIVE" ? data.planCode : "FREE";

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-text-primary">Compare plans</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {PLANS.map((plan) => {
          const isCurrent = plan.code === activePlanCode;
          return (
            <div
              key={plan.code}
              className={cn(
                "flex flex-col rounded-card border border-border bg-surface p-6 shadow-card",
                plan.code === "PREMIUM" && "border-primary"
              )}
            >
              <h3 className="text-base font-semibold text-text-primary">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-text-primary">{plan.price}</span>
                <span className="text-xs text-text-secondary">{plan.period}</span>
              </div>
              <p className="mt-2 text-xs text-text-secondary">{plan.description}</p>

              <ul className="mt-4 flex-1 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-text-primary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                type="button"
                className="mt-6 w-full"
                variant={plan.code === "PREMIUM" ? "primary" : "outline"}
                disabled={isCurrent || plan.code === "FREE"}
                onClick={() => onSelectPlan(plan.code)}
              >
                {isCurrent
                  ? "Current plan"
                  : plan.code === "FREE"
                    ? "Downgrade unavailable"
                    : "Upgrade to Premium"}
              </Button>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-text-secondary">
        Pricing shown is placeholder data pending final product pricing — not final billing figures.
      </p>
    </div>
  );
}
