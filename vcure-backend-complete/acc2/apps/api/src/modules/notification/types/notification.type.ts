import { NotificationType } from '@prisma/client';

/** Mirrors ACC1 `NotificationItem` exactly. */
export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionRoute?: string;
}
