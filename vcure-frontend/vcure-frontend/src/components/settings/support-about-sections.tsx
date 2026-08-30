import { LifeBuoy, Info } from "lucide-react";

export function SupportSection() {
  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <LifeBuoy className="h-4 w-4" aria-hidden="true" />
        Support
      </h2>
      <p className="mt-2 text-sm text-text-secondary">
        Need help? Reach out at{" "}
        <a href="mailto:support@vcure.app" className="text-primary hover:underline">
          support@vcure.app
        </a>
        .
      </p>
    </div>
  );
}

export function AboutSection() {
  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Info className="h-4 w-4" aria-hidden="true" />
        About
      </h2>
      <p className="mt-2 text-sm text-text-secondary">V-Cure v1.0.0</p>
      <div className="mt-2 flex gap-4 text-xs">
        <a href="/privacy" className="text-primary hover:underline">
          Privacy policy
        </a>
        <a href="/terms" className="text-primary hover:underline">
          Terms of service
        </a>
      </div>
    </div>
  );
}
