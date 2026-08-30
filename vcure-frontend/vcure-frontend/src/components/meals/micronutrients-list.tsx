import type { Micronutrient } from "@/types/nutrition";

export function MicronutrientsList({ micronutrients }: { micronutrients: Micronutrient[] }) {
  if (micronutrients.length === 0) {
    return <p className="text-sm text-text-secondary">No micronutrient data for this meal.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {micronutrients.map((nutrient) => (
        <li key={nutrient.name}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-primary">{nutrient.name}</span>
            <span className="text-text-secondary">
              {nutrient.amount} · {nutrient.percentOfDailyValue}% DV
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, nutrient.percentOfDailyValue)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
