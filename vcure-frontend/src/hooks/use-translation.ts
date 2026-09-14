import { useLanguageStore } from "@/store/language-store";
import type { TranslationDictionary, Language } from "@/constants/translations";

export function useTranslation() {
  const { language, setLanguage, getTranslation } = useLanguageStore();
  const t: TranslationDictionary = getTranslation();

  return {
    t,
    language,
    setLanguage
  };
}
