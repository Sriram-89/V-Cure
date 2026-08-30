"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useUpdateUserStatus } from "@/hooks/use-admin";
import type { AdminUserListItem, AdminUserStatus } from "@/types/admin";

const NEXT_ACTIONS: Record<AdminUserStatus, { label: string; nextStatus: AdminUserStatus }[]> = {
  ACTIVE: [
    { label: "Suspend", nextStatus: "SUSPENDED" },
    { label: "Block", nextStatus: "BLOCKED" }
  ],
  SUSPENDED: [
    { label: "Activate", nextStatus: "ACTIVE" },
    { label: "Block", nextStatus: "BLOCKED" }
  ],
  BLOCKED: [{ label: "Activate", nextStatus: "ACTIVE" }]
};

export function UserStatusActions({ user }: { user: AdminUserListItem }) {
  const updateStatus = useUpdateUserStatus();
  const [pendingAction, setPendingAction] = useState<{ label: string; nextStatus: AdminUserStatus } | null>(null);

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {NEXT_ACTIONS[user.status].map((action) => (
        <Button
          key={action.nextStatus}
          type="button"
          variant={action.nextStatus === "BLOCKED" ? "danger" : "outline"}
          size="sm"
          onClick={() => setPendingAction(action)}
        >
          {action.label}
        </Button>
      ))}

      <ConfirmDialog
        isOpen={pendingAction !== null}
        title={`${pendingAction?.label} ${user.fullName}?`}
        description={`This changes the account status to ${pendingAction?.nextStatus.toLowerCase()} and is recorded in the audit log.`}
        confirmLabel={pendingAction?.label ?? "Confirm"}
        variant={pendingAction?.nextStatus === "BLOCKED" ? "danger" : "primary"}
        isConfirming={updateStatus.isPending}
        onConfirm={() => {
          if (pendingAction) {
            updateStatus.mutate({ userId: user.id, status: pendingAction.nextStatus });
          }
          setPendingAction(null);
        }}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
