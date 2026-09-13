"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import type { AdminContentInput, AdminContentItem } from "@/types/admin";

export function AdminContentForm({
  initialValues,
  onCancel,
  onSubmit,
  isSubmitting
}: {
  initialValues?: AdminContentItem;
  onCancel: () => void;
  onSubmit: (input: AdminContentInput) => void;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [isPublished, setIsPublished] = useState(initialValues?.isPublished ?? false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setError(null);
    onSubmit({ title: title.trim(), isPublished });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-border p-4">
      <InputField
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        error={error ?? undefined}
      />
      <label className="flex items-center gap-2 text-sm text-text-primary">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-border"
          checked={isPublished}
          onChange={(event) => setIsPublished(event.target.checked)}
        />
        Published
      </label>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isSubmitting}>
          Save
        </Button>
      </div>
    </form>
  );
}
