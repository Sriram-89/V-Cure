"use client";

import { cn } from "@/lib/cn";

function getWeekDates(centerIso: string): string[] {
  const center = new Date(centerIso);
  const dayOfWeek = center.getDay();
  const start = new Date(center);
  start.setDate(center.getDate() - dayOfWeek);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function MealCalendar({
  selectedDate,
  onSelect
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  const weekDates = getWeekDates(selectedDate);
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      role="tablist"
      aria-label="Select a day"
    >
      {weekDates.map((dateIso) => {
        const date = new Date(dateIso);
        const isSelected = dateIso === selectedDate;
        const isToday = dateIso === todayIso;

        return (
          <button
            key={dateIso}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(dateIso)}
            className={cn(
              "flex min-w-[64px] flex-col items-center gap-1 rounded-card border border-border px-3 py-2",
              isSelected && "border-primary bg-primary-50"
            )}
          >
            <span className="text-xs text-text-secondary">
              {date.toLocaleDateString(undefined, { weekday: "short" })}
            </span>
            <span
              className={cn(
                "text-sm font-semibold",
                isSelected ? "text-primary-700" : "text-text-primary"
              )}
            >
              {date.getDate()}
            </span>
            {isToday ? (
              <span className="h-1 w-1 rounded-full bg-primary" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
