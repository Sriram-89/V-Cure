"use client";

import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  value,
  unit,
  onChange,
  min = 0,
  max = 99
}: {
  value: number;
  unit: string;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-surface-muted disabled:opacity-40"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
      <span className="w-16 text-center text-sm text-text-primary" aria-live="polite">
        {value} {unit}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-text-secondary hover:bg-surface-muted disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}
