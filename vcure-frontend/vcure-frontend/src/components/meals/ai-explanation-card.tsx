import { Sparkles } from "lucide-react";

export function AiExplanationCard({ explanation }: { explanation: string }) {
  return (
    <div className="rounded-md bg-primary-50 p-4">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-700">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Why this meal
      </h3>
      <p className="mt-2 text-sm text-primary-900">{explanation}</p>
    </div>
  );
}
