"use client";

import { AlertCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SectionCard({
  title,
  isLoading,
  isError,
  isEditing,
  onEditToggle,
  children
}: {
  title: string;
  isLoading?: boolean;
  isError?: boolean;
  isEditing: boolean;
  onEditToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {!isLoading && !isError ? (
          <Button variant="ghost" size="sm" onClick={onEditToggle}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        ) : null}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface-muted" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Couldn&apos;t load this section.
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
