"use client";

import { useState } from "react";
import { AlertCircle, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { NotificationListItem } from "@/components/notifications/notification-list-item";
import {
  useNotifications,
  useMarkNotificationRead,
  useDeleteNotification
} from "@/hooks/use-notifications";

export function NotificationList() {
  const { data, isLoading, isError, refetch, isRefetching } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const deleteNotification = useDeleteNotification();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-md bg-surface-muted" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <AlertCircle className="h-6 w-6 text-danger" aria-hidden="true" />
        <p className="text-sm text-text-secondary">Couldn&apos;t load your notifications.</p>
        <Button type="button" onClick={() => refetch()} isLoading={isRefetching}>
          Retry
        </Button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <BellOff className="h-8 w-8 text-text-secondary" aria-hidden="true" />
        <p className="text-sm text-text-secondary">No notifications yet.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-1" aria-label="Notifications">
        {data.map((notification) => (
          <NotificationListItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={(id) => markAsRead.mutate(id)}
            onDelete={(id) => setPendingDeleteId(id)}
          />
        ))}
      </ul>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        title="Delete this notification?"
        description="This notification will be permanently removed."
        confirmLabel="Delete"
        isConfirming={deleteNotification.isPending}
        onConfirm={() => {
          if (pendingDeleteId) deleteNotification.mutate(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
}
