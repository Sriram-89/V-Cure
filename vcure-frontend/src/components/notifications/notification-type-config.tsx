import {
  UtensilsCrossed,
  Droplets,
  Pill,
  Activity,
  Moon,
  BookOpen,
  Trophy,
  Crown,
  AlertTriangle,
  type LucideIcon
} from "lucide-react";
import type { NotificationType } from "@/types/notifications";

export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { label: string; icon: LucideIcon }
> = {
  MEAL_REMINDER: { label: "Meal reminder", icon: UtensilsCrossed },
  WATER_REMINDER: { label: "Water reminder", icon: Droplets },
  MEDICINE_REMINDER: { label: "Medicine reminder", icon: Pill },
  EXERCISE_REMINDER: { label: "Exercise reminder", icon: Activity },
  SLEEP_REMINDER: { label: "Sleep reminder", icon: Moon },
  HEALTH_TIP: { label: "Health tip", icon: BookOpen },
  ACHIEVEMENT: { label: "Achievement", icon: Trophy },
  SUBSCRIPTION: { label: "Subscription", icon: Crown },
  CRITICAL_ALERT: { label: "Critical alert", icon: AlertTriangle }
};
