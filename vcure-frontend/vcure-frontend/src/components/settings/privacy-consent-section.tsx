"use client";

import { ShieldCheck } from "lucide-react";
import { SaveStatus } from "@/components/settings/save-status";
import { useSaveStatus } from "@/hooks/use-save-status";
import { usePrivacyConsent, useUpdatePrivacyConsent } from "@/hooks/use-settings";

export function PrivacyConsentSection() {
  const { data, isLoading, isError } = usePrivacyConsent();
  const updateConsent = useUpdatePrivacyConsent();
  const status = useSaveStatus(updateConsent);

  if (isLoading) return <div className="h-32 animate-pulse rounded-card bg-surface-muted" />;
  if (isError || !data) return <p className="text-sm text-danger">Couldn&apos;t load privacy settings.</p>;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Privacy
        </h2>
        <SaveStatus status={status} />
      </div>

      <label className="mt-4 flex items-start justify-between gap-4">
        <span>
          <span className="block text-sm text-text-primary">
            Share anonymized data to improve recommendations
          </span>
          <span className="block text-xs text-text-secondary">
            Helps improve the recommendation engine for everyone. Your medical data is never
            shared identifiably — this can be turned off at any time.
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          aria-checked={data.shareDataForResearch}
          checked={data.shareDataForResearch}
          onChange={(event) => updateConsent.mutate({ shareDataForResearch: event.target.checked })}
          className="h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-surface-muted transition-colors checked:bg-primary relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
        />
      </label>
    </div>
  );
}
