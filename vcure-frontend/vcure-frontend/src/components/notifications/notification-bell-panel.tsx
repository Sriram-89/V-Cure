"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, AlertCircle, BellOff } from "lucide-react";
import { NotificationListItem } from "@/components/notifications/notification-list-item";
import { useNotifications, useMarkNotificationRead } from "@/hooks/use-notifications";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/cn";

export function NotificationBellPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError } = useNotifications();
  const markAsRead = useMarkNotificationRead();

  const unreadCount = data?.filter((n) => !n.isRead).length ?? 0;
  const recent = (data ?? []).slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-text-secondary hover:bg-surface-muted"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 ? (
          <span
            className={cn(
              "absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white"
            )}
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      <span className="sr-only" aria-live="polite">
        {unreadCount > 0 ? `${unreadCount} unread notifications` : "No unread notifications"}
      </span>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-card border border-border bg-surface p-3 shadow-modal">
          <div className="flex items-center justify-between px-1 pb-2">
            <p className="text-sm font-semibold text-text-primary">Notifications</p>
            <Link
              href={ROUTES.NOTIFICATIONS}
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2 p-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-md bg-surface-muted" />
              ))}
            </div>
          ) : isError || !data ? (
            <div className="flex items-center gap-2 p-3 text-sm text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Couldn&apos;t load notifications.
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <BellOff className="h-6 w-6 text-text-secondary" aria-hidden="true" />
              <p className="text-sm text-text-secondary">No notifications yet.</p>
            </div>
          ) : (
            <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto" aria-label="Recent notifications">
              {recent.map((notification) => (
                <NotificationListItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={(id) => markAsRead.mutate(id)}
                  onDelete={() => {}}
                  showDelete={false}
                />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
