"use client";

import { CheckCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationPreferencesSection } from "@/components/settings/notification-preferences-section";
import { useNotifications, useMarkAllNotificationsRead } from "@/hooks/use-notifications";

export default function NotificationsPage() {
  const { data } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadIds = data?.filter((n) => !n.isRead).map((n) => n.id) ?? [];

  return (
    <Container className="max-w-2xl py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Notifications</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Reminders, tips, and updates in one place.
          </p>
        </div>
        {unreadIds.length > 0 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate(unreadIds)}
            isLoading={markAllRead.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Mark all as read
          </Button>
        ) : null}
      </div>

      <div className="mt-6 rounded-card border border-border bg-surface p-4 shadow-card">
        <NotificationList />
      </div>

      <div className="mt-6">
        <NotificationPreferencesSection />
      </div>
    </Container>
  );
}
