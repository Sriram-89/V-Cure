import { Check, AlertCircle, Loader2 } from "lucide-react";

export function SaveStatus({
  status
}: {
  status: "idle" | "saving" | "saved" | "error";
}) {
  if (status === "idle") return null;

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-text-secondary" aria-live="polite">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Saving...
      </span>
    );
  }

  if (status === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-primary" role="status">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Saved
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-danger" role="alert">
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      Couldn&apos;t save. Try again.
    </span>
  );
}
