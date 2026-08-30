// Notification categories documented across the bible:
// - Data_Layer.docx Use Case 27: Meal, Water, Exercise, Medicine, Sleep reminders + Health Tips
// - Development_Layer.docx API 59 (GET /notifications "Returns"): Meal, Water,
//   Medicine, Exercise reminders + Health Tips
// - AI_Design.docx §66 Notification Experience: Meal, Water, Medicine,
//   Exercise reminders + Achievement, Subscription, Critical Alerts
// These three lists don't fully overlap. The union below is used as the
// type so nothing documented is dropped, and nothing undocumented is added.
export type NotificationType =
  | "MEAL_REMINDER"
  | "WATER_REMINDER"
  | "MEDICINE_REMINDER"
  | "EXERCISE_REMINDER"
  | "SLEEP_REMINDER"
  | "HEALTH_TIP"
  | "ACHIEVEMENT"
  | "SUBSCRIPTION"
  | "CRITICAL_ALERT";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  // "Notifications should be actionable" (AI_Design.docx §66) — where a
  // notification relates to something navigable, this points to it.
  actionRoute?: string;
}
