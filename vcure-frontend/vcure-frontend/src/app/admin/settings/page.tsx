"use client";

import { SlidersHorizontal } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useFeatureFlags, useUpdateFeatureFlag } from "@/hooks/use-admin";

export default function AdminSettingsPage() {
  const { data, isLoading, isError } = useFeatureFlags();
  const updateFlag = useUpdateFeatureFlag();

  return (
    <Container className="max-w-2xl py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Settings</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Feature flags (API 73: GET/PUT /api/v1/admin/settings).
      </p>

      <div className="mt-6 rounded-card border border-border bg-surface p-6 shadow-card">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Feature flags
        </h2>
        <p className="mt-1 text-xs text-text-secondary">
          Enable or disable platform-wide features without a redeployment.
        </p>

        {isLoading ? (
          <div className="mt-4 space-y-2">
            <div className="h-12 animate-pulse rounded-md bg-surface-muted" />
            <div className="h-12 animate-pulse rounded-md bg-surface-muted" />
          </div>
        ) : isError || !data ? (
          <p className="mt-4 text-sm text-danger">Couldn&apos;t load settings.</p>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-border">
            {data.map((flag) => (
              <label key={flag.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-text-primary">{flag.label}</span>
                <input
                  type="checkbox"
                  role="switch"
                  aria-checked={flag.isEnabled}
                  checked={flag.isEnabled}
                  onChange={(event) =>
                    updateFlag.mutate({ key: flag.key, isEnabled: event.target.checked })
                  }
                  className="h-5 w-9 shrink-0 cursor-pointer appearance-none rounded-full bg-surface-muted transition-colors checked:bg-primary relative before:absolute before:left-0.5 before:top-0.5 before:h-4 before:w-4 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-4"
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
