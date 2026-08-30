import * as React from "react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectFieldProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, placeholder, error, id, className, ...props }, ref) => {
    const selectId = id ?? props.name;
    const errorId = error ? `${selectId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-text-primary">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-11 rounded-input border border-border bg-surface px-3 text-sm text-text-primary",
            "focus-visible:border-primary",
            error && "border-danger",
            className
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          defaultValue=""
          {...props}
        >
          <option value="" disabled>
            {placeholder ?? "Select an option"}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
SelectField.displayName = "SelectField";
