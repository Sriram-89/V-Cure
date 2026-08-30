"use client";

import { useState } from "react";
import { AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";

export interface ResourceListCardProps<TItem extends { id: string }> {
  title: string;
  items: TItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  emptyLabel: string;
  addLabel: string;
  renderRow: (item: TItem) => React.ReactNode;
  renderForm: (props: {
    initialValues?: TItem;
    onCancel: () => void;
    onSubmit: (values: Omit<TItem, "id">) => void;
    isSubmitting: boolean;
    submitError?: string;
  }) => React.ReactNode;
  onCreate: (values: Omit<TItem, "id">) => void;
  onUpdate: (id: string, values: Omit<TItem, "id">) => void;
  onDelete: (id: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  createError?: string;
  updateError?: string;
}

export function ResourceListCard<TItem extends { id: string }>({
  title,
  items,
  isLoading,
  isError,
  emptyLabel,
  addLabel,
  renderRow,
  renderForm,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
  isUpdating,
  isDeleting,
  createError,
  updateError
}: ResourceListCardProps<TItem>) {
  const [mode, setMode] = useState<"idle" | "adding" | "editing">("idle");
  const [editingItem, setEditingItem] = useState<TItem | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
        {mode === "idle" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setMode("adding");
            }}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {addLabel}
          </Button>
        ) : null}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-muted" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-sm text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Couldn&apos;t load this section.
          </div>
        ) : (
          <>
            {mode === "adding" ? (
              <div className="mb-4 rounded-md border border-border p-4">
                {renderForm({
                  onCancel: () => setMode("idle"),
                  onSubmit: (values) => {
                    onCreate(values);
                    setMode("idle");
                  },
                  isSubmitting: isCreating,
                  submitError: createError
                })}
              </div>
            ) : null}

            {items && items.length === 0 && mode !== "adding" ? (
              <p className="py-4 text-sm text-text-secondary">{emptyLabel}</p>
            ) : null}

            <ul className="space-y-2">
              {(items ?? []).map((item) =>
                mode === "editing" && editingItem?.id === item.id ? (
                  <li key={item.id} className="rounded-md border border-border p-4">
                    {renderForm({
                      initialValues: item,
                      onCancel: () => setMode("idle"),
                      onSubmit: (values) => {
                        onUpdate(item.id, values);
                        setMode("idle");
                      },
                      isSubmitting: isUpdating,
                      submitError: updateError
                    })}
                  </li>
                ) : (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-md bg-surface-muted p-3"
                  >
                    <div className="min-w-0 flex-1 text-sm text-text-primary">
                      {renderRow(item)}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label="Edit"
                        onClick={() => {
                          setEditingItem(item);
                          setMode("editing");
                        }}
                        className="rounded-md p-1.5 text-text-secondary hover:bg-surface hover:text-text-primary"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete"
                        onClick={() => setPendingDeleteId(item.id)}
                        className="rounded-md p-1.5 text-text-secondary hover:bg-red-50 hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                )
              )}
            </ul>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Remove this entry?"
        description="This will be removed from your medical history. You can add it again later if needed."
        confirmLabel="Remove"
        isConfirming={isDeleting}
        onConfirm={() => {
          if (pendingDeleteId) onDelete(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
