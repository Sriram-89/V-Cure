"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { NOTIFICATION_TYPE_CONFIG } from "@/components/notifications/notification-type-config";
import type { NotificationItem as NotificationItemType } from "@/types/notifications";

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function NotificationListItem({
  notification,
  onMarkAsRead,
  onDelete,
  showDelete = true
}: {
  notification: NotificationItemType;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  showDelete?: boolean;
}) {
  const router = useRouter();
  const { label, icon: Icon } = NOTIFICATION_TYPE_CONFIG[notification.type];

  const handleActivate = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    if (notification.actionRoute) {
      router.push(notification.actionRoute);
    }
  };

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-md p-3 transition-colors",
        !notification.isRead && "bg-primary-50"
      )}
    >
      <span
        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-text-secondary"
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>

      <button
        type="button"
        onClick={handleActivate}
        className="min-w-0 flex-1 rounded-md text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm text-text-primary",
              !notification.isRead && "font-semibold"
            )}
          >
            {notification.title}
            {!notification.isRead ? (
              <span className="ml-2 inline-flex items-center gap-1 align-middle">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                <span className="sr-only">Unread</span>
              </span>
            ) : (
              <span className="sr-only"> — Read</span>
            )}
          </p>
          <span className="shrink-0 text-xs text-text-secondary">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-text-secondary">{label}</p>
        <p className="mt-1 text-sm text-text-secondary">{notification.message}</p>
      </button>

      {showDelete ? (
        <button
          type="button"
          aria-label={`Delete notification: ${notification.title}`}
          onClick={() => onDelete(notification.id)}
          className="shrink-0 rounded-md p-1.5 text-text-secondary hover:bg-red-50 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </li>
  );
}
