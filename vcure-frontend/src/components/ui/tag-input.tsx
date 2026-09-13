"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export interface TagInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  emptyStateLabel?: string;
  error?: string;
}

export function TagInput({
  label,
  values,
  onChange,
  placeholder,
  emptyStateLabel = "None added yet",
  error
}: TagInputProps) {
  const [draft, setDraft] = React.useState("");
  const inputId = React.useId();

  const addTag = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;
    if (values.some((value) => value.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...values, trimmed]);
    setDraft("");
  };

  const removeTag = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
        {label}
      </label>

      <div
        className={cn(
          "flex min-h-[44px] flex-wrap items-center gap-2 rounded-input border border-border bg-surface p-2",
          error && "border-danger"
        )}
      >
        {values.length === 0 ? (
          <span className="px-1 text-sm text-text-secondary">{emptyStateLabel}</span>
        ) : (
          values.map((value, index) => (
            <span
              key={`${value}-${index}`}
              className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
            >
              {value}
              <button
                type="button"
                onClick={() => removeTag(index)}
                aria-label={`Remove ${value}`}
                className="rounded-full hover:bg-primary-100"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))
        )}
        <input
          id={inputId}
          type="text"
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addTag();
            }
          }}
          onBlur={addTag}
          className="min-w-[120px] flex-1 border-none bg-transparent text-sm text-text-primary outline-none"
        />
      </div>
      <p className="text-xs text-text-secondary">Press Enter to add.</p>
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
