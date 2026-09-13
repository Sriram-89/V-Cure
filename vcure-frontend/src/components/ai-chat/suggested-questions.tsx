"use client";

import { useSuggestedQuestions } from "@/hooks/use-ai-chat";

export function SuggestedQuestions({ onSelect }: { onSelect: (prompt: string) => void }) {
  const { data, isLoading, isError } = useSuggestedQuestions();

  if (isLoading || isError || !data || data.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pb-3">
      {data.map((question) => (
        <button
          key={question.id}
          type="button"
          onClick={() => onSelect(question.prompt)}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-text-secondary hover:border-primary hover:text-primary"
        >
          {question.label}
        </button>
      ))}
    </div>
  );
}
