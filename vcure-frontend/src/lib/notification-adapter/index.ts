import type { NotificationAdapter } from "@/lib/notification-adapter/types";
import { mockNotificationAdapter } from "@/lib/notification-adapter/mock-adapter";

// TODO(backend): the real endpoints are already documented —
// GET /api/v1/notifications (API 59), PUT /api/v1/notifications/{id}/read
// (API 60), DELETE /api/v1/notifications/{id} (API 61). Once they're live,
// implement a RealNotificationAdapter against apiClient hitting those exact
// paths and swap it in here. No component or hook in
// src/components/notifications or src/hooks/use-notifications.ts should
// need to change.
export const notificationAdapter: NotificationAdapter = mockNotificationAdapter;

export type { NotificationAdapter } from "@/lib/notification-adapter/types";
