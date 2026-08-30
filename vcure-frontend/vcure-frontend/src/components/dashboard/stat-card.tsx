import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary"
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "secondary";
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-secondary">{label}</span>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md",
            tone === "primary" ? "bg-primary-50 text-primary" : "bg-secondary-50 text-secondary"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-text-primary">{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-secondary">{hint}</p> : null}
    </div>
  );
}
