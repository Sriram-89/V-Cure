"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useDeleteAccount } from "@/hooks/use-delete-account";
import { getProfileErrorMessage } from "@/hooks/use-profile";

export function DeleteAccountSection() {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const deleteAccount = useDeleteAccount();

  const isConfirmationValid = confirmationText === "DELETE";

  return (
    <div className="rounded-card border border-danger/30 bg-surface p-6 shadow-card">
      <h2 className="text-sm font-semibold text-danger">Delete account</h2>
      <p className="mt-1 text-sm text-text-secondary">
        This permanently deletes your profile, medical history, and plans. This can&apos;t be
        undone.
      </p>

      {deleteAccount.isError ? (
        <div role="alert" className="mt-4 flex items-center gap-2 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {getProfileErrorMessage(deleteAccount.error)}
        </div>
      ) : null}

      <div className="mt-4 max-w-sm">
        <InputField
          label='Type "DELETE" to confirm'
          value={confirmationText}
          onChange={(event) => setConfirmationText(event.target.value)}
        />
      </div>

      <Button
        type="button"
        variant="danger"
        className="mt-4"
        disabled={!isConfirmationValid}
        onClick={() => setIsDialogOpen(true)}
      >
        Delete my account
      </Button>

      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Delete your account?"
        description="All of your data will be permanently removed. This action cannot be reversed."
        confirmLabel="Yes, delete everything"
        isConfirming={deleteAccount.isPending}
        onConfirm={() => deleteAccount.mutate()}
        onCancel={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
