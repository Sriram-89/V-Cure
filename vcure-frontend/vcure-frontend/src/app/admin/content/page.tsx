"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle, Plus, Pencil, Trash2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { AdminDataTable, type AdminTableColumn } from "@/components/admin/admin-data-table";
import { AdminContentForm } from "@/components/admin/admin-content-form";
import {
  useAdminContent,
  useCreateAdminContent,
  useUpdateAdminContent,
  useDeleteAdminContent
} from "@/hooks/use-admin";
import { ROUTES } from "@/constants/routes";
import type { AdminContentItem, AdminContentType } from "@/types/admin";

const TABS: { type: AdminContentType; label: string }[] = [
  { type: "FOOD", label: "Foods" },
  { type: "RECIPE", label: "Recipes" },
  { type: "ARTICLE", label: "Articles" },
  { type: "VIDEO", label: "Videos" }
];

function ContentManagementInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeType = (searchParams.get("type") as AdminContentType) ?? "FOOD";

  const { data, isLoading, isError, refetch } = useAdminContent(activeType);
  const createContent = useCreateAdminContent(activeType);
  const updateContent = useUpdateAdminContent(activeType);
  const deleteContent = useDeleteAdminContent(activeType);

  const [mode, setMode] = useState<"idle" | "adding" | "editing">("idle");
  const [editingItem, setEditingItem] = useState<AdminContentItem | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const columns: AdminTableColumn<AdminContentItem>[] = [
    { key: "title", label: "Title", render: (row) => row.title },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge variant={row.isPublished ? "primary" : "neutral"}>{row.isPublished ? "Published" : "Draft"}</Badge>
    },
    { key: "updatedAt", label: "Updated", render: (row) => new Date(row.updatedAt).toLocaleDateString() }
  ];

  return (
    <Container className="max-w-5xl py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Content management</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Create, edit, and remove Foods, Recipes, Articles, and Videos (API 69-72).
      </p>

      <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-warning">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        The list below is mock-only — API 69-72 document create/update/delete but no listing
        endpoint, so this table isn&apos;t backed by a real documented contract yet.
      </div>

      <div role="tablist" aria-label="Content type" className="mt-4 flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            type="button"
            role="tab"
            aria-selected={activeType === tab.type}
            onClick={() => {
              setMode("idle");
              router.push(`${ROUTES.ADMIN}/content?type=${tab.type}`);
            }}
            className={
              activeType === tab.type
                ? "shrink-0 rounded-full border border-primary bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700"
                : "shrink-0 rounded-full border border-border px-4 py-2 text-sm text-text-primary"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-card border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">
            {TABS.find((t) => t.type === activeType)?.label}
          </h2>
          {mode === "idle" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingItem(null);
                setMode("adding");
              }}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add new
            </Button>
          ) : null}
        </div>

        {mode === "adding" ? (
          <div className="mt-4">
            <AdminContentForm
              onCancel={() => setMode("idle")}
              onSubmit={(input) => {
                createContent.mutate(input, { onSuccess: () => setMode("idle") });
              }}
              isSubmitting={createContent.isPending}
            />
          </div>
        ) : null}

        {mode === "editing" && editingItem ? (
          <div className="mt-4">
            <AdminContentForm
              initialValues={editingItem}
              onCancel={() => setMode("idle")}
              onSubmit={(input) => {
                updateContent.mutate(
                  { id: editingItem.id, input },
                  { onSuccess: () => setMode("idle") }
                );
              }}
              isSubmitting={updateContent.isPending}
            />
          </div>
        ) : null}

        <div className="mt-4">
          <AdminDataTable
            columns={columns}
            rows={mode === "idle" ? data : undefined}
            isLoading={isLoading && mode === "idle"}
            isError={isError}
            emptyLabel={`No ${TABS.find((t) => t.type === activeType)?.label.toLowerCase()} yet.`}
            onRetry={() => refetch()}
            actions={
              mode === "idle"
                ? (row) => (
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${row.title}`}
                        onClick={() => {
                          setEditingItem(row);
                          setMode("editing");
                        }}
                        className="rounded-md p-1.5 text-text-secondary hover:bg-surface-muted"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${row.title}`}
                        onClick={() => setPendingDeleteId(row.id)}
                        className="rounded-md p-1.5 text-text-secondary hover:bg-red-50 hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )
                : undefined
            }
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete this item?"
        description="This will be permanently removed."
        confirmLabel="Delete"
        isConfirming={deleteContent.isPending}
        onConfirm={() => {
          if (pendingDeleteId) deleteContent.mutate(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </Container>
  );
}

export default function AdminContentPage() {
  return (
    <Suspense fallback={null}>
      <ContentManagementInner />
    </Suspense>
  );
}
