"use client";

import { Languages } from "lucide-react";
import { SaveStatus } from "@/components/settings/save-status";
import { useSaveStatus } from "@/hooks/use-save-status";
import { useLanguageSettings, useUpdateLanguageSettings } from "@/hooks/use-settings";
import { useLanguageStore } from "@/store/language-store";
import type { Language } from "@/constants/translations";
import { useTranslation } from "@/hooks/use-translation";

const AVAILABLE_LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "mr", label: "మరాఠీ (Marathi)" },
  { code: "bn", label: "বাংলা (Bengali)" }
];

export function LanguageSettingsSection() {
  const { data, isLoading, isError } = useLanguageSettings();
  const updateLanguage = useUpdateLanguageSettings();
  const status = useSaveStatus(updateLanguage);
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const handleLanguageChange = async (langCode: Language) => {
    await setLanguage(langCode);
    updateLanguage.mutate({ languageCode: langCode as any });
  };

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <Languages className="h-4 w-4" aria-hidden="true" />
          {t.changeLanguage}
        </h2>
        <SaveStatus status={status} />
      </div>

      {isLoading ? (
        <div className="mt-4 h-10 w-48 animate-pulse rounded-md bg-surface-muted" />
      ) : (
        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Language">
          {AVAILABLE_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleLanguageChange(lang.code)}
                className={
                  isSelected
                    ? "rounded-full border border-primary bg-primary-50 px-4 py-2 text-sm font-bold text-primary-700 shadow-xs"
                    : "rounded-full border border-border px-4 py-2 text-sm text-text-primary hover:bg-surface-muted transition-all"
                }
              >
                {lang.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

