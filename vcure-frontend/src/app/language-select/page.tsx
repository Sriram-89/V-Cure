"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { VCureSymbolLogo } from "@/components/ui/vcure-logo";
import { useLanguageStore } from "@/store/language-store";
import type { Language } from "@/constants/translations";

const LANGUAGES: { id: Language; name: string; nativeName: string; symbol: string }[] = [
  { id: "en", name: "English", nativeName: "Standard English", symbol: "EN" },
  { id: "te", name: "Telugu", nativeName: "తెలుగు", symbol: "తె" },
  { id: "hi", name: "Hindi", nativeName: "हिन्दी", symbol: "హి" },
  { id: "ta", name: "Tamil", nativeName: "தமிழ்", symbol: "త" },
  { id: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", symbol: "క" },
  { id: "ml", name: "Malayalam", nativeName: "മലയാളം", symbol: "మ" },
  { id: "mr", name: "Marathi", nativeName: "मराठी", symbol: "మ" },
  { id: "bn", name: "Bengali", nativeName: "বাংলা", symbol: "బె" }
];

export default function LanguageSelectPage() {
  const router = useRouter();
  const currentLanguage = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.getTranslation());

  const [selected, setSelected] = useState<Language>(currentLanguage || "en");

  const handleConfirm = () => {
    void setLanguage(selected);
    router.push("/auth/register");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between py-8 px-4">
      <Container className="max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-3 pt-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 p-2.5 border border-emerald-100 shadow-md">
            <VCureSymbolLogo className="h-full w-full" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            {t.selectLanguageTitle}
          </h1>
          <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
            {t.selectLanguageSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-2 max-h-[55vh] overflow-y-auto pr-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setSelected(lang.id)}
              className={`w-full flex items-center justify-between rounded-2xl border p-3.5 transition-all shadow-xs ${
                selected === lang.id
                  ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                  {lang.symbol}
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-bold text-gray-900">{lang.name}</h3>
                  <p className="text-[10px] font-medium text-gray-500">{lang.nativeName}</p>
                </div>
              </div>
              {selected === lang.id ? (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-3.5 w-3.5" />
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </Container>

      <Container className="max-w-md pt-4">
        <Button
          type="button"
          onClick={handleConfirm}
          className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
        >
          {t.continueToSignup}
        </Button>
      </Container>
    </div>
  );
}

