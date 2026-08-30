"use client";

import { Bell } from "lucide-react";
import { SaveStatus } from "@/components/settings/save-status";
import { useSaveStatus } from "@/hooks/use-save-status";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/hooks/use-settings";
import type { NotificationPreferences } from "@/types/settings";

const TOGGLES: { key: keyof NotificationPreferences; label: string; description: string }[] = [
  { key: "mealReminder", label: "Meal reminders", description: "Nudges to log breakfast, lunch, dinner, and snacks" },
  { key: "waterReminder", label: "Water reminders", description: "Reminders to hit your daily water target" },
  { key: "exerciseReminder", label: "Exercise reminders", description: "Prompts to stay active during the day" },
  { key: "medicineReminder", label: "Medicine reminders", description: "Alerts for scheduled medications" },
  { key: "sleepReminder", label: "Sleep reminders", description: "A nudge toward a consistent bedtime" },
  { key: "healthTips", label: "Health tips", description: "Occasional educational tips and articles" }
];

export function NotificationPreferencesSection() {
  const { data, isLoading, isError } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const status = useSaveStatus(updatePreferences);

  if (isLoading) return <div className="h-64 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load notification preferences.</p>;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Bell className="h-4 w-4" aria-hidden="true" />
          Notifications
        </h2>
        <SaveStatus status={status} />
      </div>

      <div className="mt-4 flex flex-col divide-y divide-border">
        {TOGGLES.map((toggle) => (
          <label
            key={toggle.key}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <span>
              <span className="block text-sm text-text-primary">{toggle.label}</span>
              <span className="block text-xs text-text-secondary">{toggle.description}</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              aria-checked={data[toggle.key]}
              checked={data[toggle.key]}
              onChange={(event) =>
                updatePreferences.mutate({ ...data, [toggle.key]: event.target.checked })
              }
              className="h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-surface-muted transition-colors checked:bg-primary relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
