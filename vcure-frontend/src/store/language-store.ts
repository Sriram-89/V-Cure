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
        // Only attempt backend sync if user is authenticated
        const accessToken = typeof window !== "undefined"
          ? (JSON.parse(localStorage.getItem("vcure-auth") || "{}")?.state?.accessToken)
          : null;
        if (accessToken) {
          try {
            await apiClient.patch("/users/me/language", { language: lang });
          } catch {
            // Fall back gracefully to client store persistence if offline
          }
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
