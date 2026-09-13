import type { RecipeInstructionStep } from "@/types/recipes";

export function CookingInstructions({ steps }: { steps: RecipeInstructionStep[] }) {
  if (steps.length === 0) {
    return <p className="text-sm text-text-secondary">No instructions available for this recipe.</p>;
  }

  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step) => (
        <li key={step.step} className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
            {step.step}
          </span>
          <p className="text-sm text-text-primary">{step.instruction}</p>
        </li>
      ))}
    </ol>
  );
}
