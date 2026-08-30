import type { NotificationAdapter } from "@/lib/notification-adapter/types";
import type { NotificationItem } from "@/types/notifications";
import { ROUTES } from "@/constants/routes";

const SIMULATED_LATENCY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

function hoursAgo(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

let notifications: NotificationItem[] = [
  {
    id: "notif-1",
    type: "MEAL_REMINDER",
    title: "Time for lunch",
    message: "Your recommended lunch — Grilled Paneer Bowl — is ready to log.",
    isRead: false,
    createdAt: hoursAgo(1),
    actionRoute: ROUTES.MEALS
  },
  {
    id: "notif-2",
    type: "WATER_REMINDER",
    title: "Stay hydrated",
    message: "You're at 1,000ml of your 2,500ml target today.",
    isRead: false,
    createdAt: hoursAgo(2),
    actionRoute: ROUTES.MEALS
  },
  {
    id: "notif-3",
    type: "MEDICINE_REMINDER",
    title: "Medicine reminder",
    message: "Time to take your scheduled Metformin dose.",
    isRead: false,
    createdAt: hoursAgo(3)
  },
  {
    id: "notif-4",
    type: "ACHIEVEMENT",
    title: "7-day streak reached",
    message: "You've logged a meal every day for a week. Keep it going.",
    isRead: true,
    createdAt: hoursAgo(20),
    actionRoute: ROUTES.PROGRESS
  },
  {
    id: "notif-5",
    type: "EXERCISE_REMINDER",
    title: "Move a little today",
    message: "You haven't logged any activity yet today.",
    isRead: true,
    createdAt: hoursAgo(28)
  },
  {
    id: "notif-6",
    type: "HEALTH_TIP",
    title: "New article: Understanding the Glycemic Index",
    message: "A quick read on how different carbs affect your blood sugar.",
    isRead: true,
    createdAt: hoursAgo(50),
    actionRoute: `${ROUTES.EDUCATION}/article-glycemic-index`
  },
  {
    id: "notif-7",
    type: "SUBSCRIPTION",
    title: "Your trial ends in 3 days",
    message: "Upgrade to Premium to keep AI Coach and advanced tracking.",
    isRead: true,
    createdAt: hoursAgo(70),
    actionRoute: ROUTES.PREMIUM
  }
];

export const mockNotificationAdapter: NotificationAdapter = {
  async getNotifications() {
    return delay(
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    );
  },

  async markAsRead(notificationId: string) {
    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) throw new Error(`Notification ${notificationId} not found`);
    notification.isRead = true;
    return delay({ ...notification });
  },

  async deleteNotification(notificationId: string) {
    notifications = notifications.filter((n) => n.id !== notificationId);
    return delay(undefined);
  }
};
