"use client";

import { Languages } from "lucide-react";
import { SaveStatus } from "@/components/settings/save-status";
import { useSaveStatus } from "@/hooks/use-save-status";
import { useLanguageSettings, useUpdateLanguageSettings } from "@/hooks/use-settings";
import type { LanguageCode } from "@/types/settings";

const AVAILABLE_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" }
];

const FUTURE_LANGUAGES = ["Tamil", "Kannada", "Malayalam", "Marathi"];

export function LanguageSettingsSection() {
  const { data, isLoading, isError } = useLanguageSettings();
  const updateLanguage = useUpdateLanguageSettings();
  const status = useSaveStatus(updateLanguage);

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Languages className="h-4 w-4" aria-hidden="true" />
          Language
        </h2>
        <SaveStatus status={status} />
      </div>

      {isLoading ? (
        <div className="mt-4 h-10 w-48 animate-pulse rounded-md bg-surface-muted" />
      ) : isError || !data ? (
        <p className="mt-4 text-sm text-danger">Couldn&apos;t load language settings.</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Language">
            {AVAILABLE_LANGUAGES.map((language) => {
              const isSelected = data.languageCode === language.code;
              return (
                <button
                  key={language.code}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => updateLanguage.mutate({ languageCode: language.code })}
                  className={
                    isSelected
                      ? "rounded-full border border-primary bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700"
                      : "rounded-full border border-border px-4 py-2 text-sm text-text-primary hover:bg-surface-muted"
                  }
                >
                  {language.label}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-text-secondary">
            Coming soon: {FUTURE_LANGUAGES.join(", ")}
          </p>
        </>
      )}
    </div>
  );
}
