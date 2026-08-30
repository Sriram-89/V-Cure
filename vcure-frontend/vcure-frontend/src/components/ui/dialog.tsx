"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  isConfirming,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-sm rounded-card bg-surface p-6 shadow-modal">
        <div className="flex items-start gap-3">
          {variant === "danger" ? (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-danger">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : null}
          <div>
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-text-primary">
              {title}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isConfirming}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isConfirming}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
