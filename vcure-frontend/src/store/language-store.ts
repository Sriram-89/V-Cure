import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TRANSLATIONS, type Language, type TranslationDictionary } from "@/constants/translations";
import { apiClient } from "@/lib/api-client";

interface LanguageState {
  language: Language;
  hasSelectedLanguage: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  getTranslation: () => TranslationDictionary;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "en",
      hasSelectedLanguage: false,

      setLanguage: async (lang: Language) => {
        set({ language: lang, hasSelectedLanguage: true });
        try {
          // Sync language to backend account preference if logged in
          await apiClient.patch("/users/me/language", { language: lang });
        } catch {
          // Fall back gracefully to client store persistence if offline or unauthenticated
        }
      },

      getTranslation: () => {
        const lang = get().language || "en";
        return TRANSLATIONS[lang] || TRANSLATIONS.en;
      }
    }),
    {
      name: "vcure-language-preference",
      partialize: (state) => ({
        language: state.language,
        hasSelectedLanguage: state.hasSelectedLanguage
      })
    }
  )
);
