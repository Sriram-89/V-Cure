"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_LENGTH = 1000;

export function ChatInput({
  onSend,
  disabled
}: {
  onSend: (content: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setError("Type a message before sending.");
      return;
    }
    if (trimmed.length > MAX_LENGTH) {
      setError(`Keep messages under ${MAX_LENGTH} characters.`);
      return;
    }
    setError(null);
    onSend(trimmed);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-border pt-3">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <textarea
            id="chat-input"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSubmit(event);
              }
            }}
            rows={1}
            placeholder="Ask about your plan, a meal, or your medical profile..."
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "chat-input-error" : undefined}
            className="max-h-32 w-full resize-none rounded-input border border-border bg-surface px-3 py-2.5 text-sm text-text-primary focus-visible:border-primary disabled:opacity-60"
          />
        </div>
        <Button type="submit" size="md" disabled={disabled}>
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      {error ? (
        <p id="chat-input-error" role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </form>
  );
}
