import type { NotificationItem } from "@/types/notifications";

export interface NotificationAdapter {
  // Maps to API 59: GET /api/v1/notifications
  getNotifications(): Promise<NotificationItem[]>;
  // Maps to API 60: PUT /api/v1/notifications/{id}/read
  markAsRead(notificationId: string): Promise<NotificationItem>;
  // Maps to API 61: DELETE /api/v1/notifications/{id}
  deleteNotification(notificationId: string): Promise<void>;
}
