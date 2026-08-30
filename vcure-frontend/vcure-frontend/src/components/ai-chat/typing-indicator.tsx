import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2" aria-live="polite" aria-label="AI is typing">
      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div className="flex items-center gap-1 rounded-card bg-surface-muted px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-text-secondary"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
