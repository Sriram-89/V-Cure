// Named notification-service.ts (not notification.api.ts) to match this
// project's established *-service.ts convention used by every other module
// (auth-service.ts, profile-service.ts, meal-service.ts, etc.) — the bible's
// Development_Layer.docx service-file list names it notification.api.ts,
// but following the existing architecture takes priority over that naming.
import { notificationAdapter } from "@/lib/notification-adapter";

export const notificationService = {
  getNotifications: () => notificationAdapter.getNotifications(),
  markAsRead: (notificationId: string) => notificationAdapter.markAsRead(notificationId),
  deleteNotification: (notificationId: string) =>
    notificationAdapter.deleteNotification(notificationId)
};
