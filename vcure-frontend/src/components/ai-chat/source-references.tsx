import { BookOpen, UtensilsCrossed, FileText } from "lucide-react";
import type { SourceReference } from "@/types/ai-chat";

const ICONS: Record<SourceReference["type"], typeof FileText> = {
  article: BookOpen,
  medical_profile: FileText,
  meal_plan: UtensilsCrossed
};

export function SourceReferences({ sources }: { sources: SourceReference[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {sources.map((source) => {
        const Icon = ICONS[source.type];
        return (
          <span
            key={source.id}
            className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-secondary"
          >
            <Icon className="h-3 w-3" aria-hidden="true" />
            {source.title}
          </span>
        );
      })}
    </div>
  );
}
