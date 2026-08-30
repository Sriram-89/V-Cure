"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface RadioCardOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

export interface RadioCardGroupProps {
  name: string;
  label: string;
  options: RadioCardOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export function RadioCardGroup({
  name,
  label,
  options,
  value,
  onChange,
  error
}: RadioCardGroupProps) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-text-primary">{label}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;
          return (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-card border border-border p-4 transition-colors",
                isSelected && "border-primary bg-primary-50"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {Icon ? (
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    isSelected ? "text-primary" : "text-text-secondary"
                  )}
                  aria-hidden="true"
                />
              ) : null}
              <span>
                <span className="block text-sm font-medium text-text-primary">
                  {option.label}
                </span>
                {option.description ? (
                  <span className="mt-1 block text-xs text-text-secondary">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
