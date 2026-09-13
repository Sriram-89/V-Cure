"use client";

import { HeartPulse, Apple } from "lucide-react";
import { useQuickPrompts } from "@/hooks/use-ai-chat";
import type { QuickPromptCategory } from "@/types/ai-chat";

const CATEGORY_ICON: Record<QuickPromptCategory, typeof HeartPulse> = {
  Health: HeartPulse,
  Nutrition: Apple
};

export function QuickPrompts({ onSelect }: { onSelect: (prompt: string) => void }) {
  const { data, isLoading, isError } = useQuickPrompts();

  if (isLoading) {
    return <div className="h-24 animate-pulse rounded-card bg-surface-muted" />;
  }
  if (isError || !data) {
    return <p className="text-sm text-danger">Couldn&apos;t load quick prompts.</p>;
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-card">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
        Quick prompts
      </h2>
      <div className="mt-3 flex flex-col gap-2">
        {data.map((prompt) => {
          const Icon = CATEGORY_ICON[prompt.category];
          return (
            <button
              key={prompt.id}
              type="button"
              onClick={() => onSelect(prompt.prompt)}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-muted"
            >
              <Icon className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden="true" />
              {prompt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
