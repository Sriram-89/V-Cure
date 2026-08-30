import { AlertTriangle, ShieldAlert, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SafetyWarning } from "@/types/ai-chat";

const CONFIG: Record<SafetyWarning["level"], { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: "bg-secondary-50 text-secondary-700" },
  caution: { icon: AlertTriangle, className: "bg-amber-50 text-warning" },
  blocked: { icon: ShieldAlert, className: "bg-red-50 text-danger" }
};

export function SafetyWarningBanner({ warning }: { warning: SafetyWarning }) {
  const { icon: Icon, className } = CONFIG[warning.level];
  return (
    <div className={cn("flex items-start gap-2 rounded-md p-3 text-sm", className)} role="alert">
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {warning.message}
    </div>
  );
}
