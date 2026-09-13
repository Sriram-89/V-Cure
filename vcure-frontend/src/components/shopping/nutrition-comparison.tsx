import { Flame } from "lucide-react";
import { MacroDistributionChart } from "@/components/meals/macro-distribution-chart";
import type { ProductSummary } from "@/types/shopping";

export function NutritionComparison({
  product,
  alternative
}: {
  product: ProductSummary;
  alternative: ProductSummary;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[product, alternative].map((item, index) => (
        <div key={item.id} className="rounded-card border border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {index === 0 ? "This product" : "Alternative"}
          </p>
          <p className="mt-1 text-sm font-medium text-text-primary">{item.name}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-secondary">
            <Flame className="h-3.5 w-3.5" aria-hidden="true" />
            {item.nutrition.calories} kcal per {item.unit}
          </p>
          <MacroDistributionChart macros={item.nutrition.macros} />
        </div>
      ))}
    </div>
  );
}
