"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { VCureSymbolLogo } from "@/components/ui/vcure-logo";
import { useLanguageStore } from "@/store/language-store";
import type { Language } from "@/constants/translations";

export default function LanguageSelectPage() {
  const router = useRouter();
  const currentLanguage = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.getTranslation());

  const [selected, setSelected] = useState<Language>(currentLanguage || "en");

  const handleConfirm = async () => {
    await setLanguage(selected);
    router.push("/auth/register");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between py-8 px-4">
      <Container className="max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-3 pt-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 p-3 border border-emerald-100 shadow-md">
            <VCureSymbolLogo className="h-full w-full" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {t.selectLanguageTitle}
          </h1>
          <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
            {t.selectLanguageSubtitle}
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <button
            type="button"
            onClick={() => setSelected("en")}
            className={`w-full flex items-center justify-between rounded-3xl border p-5 transition-all shadow-xs ${
              selected === "en"
                ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-sm">
                EN
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">English</h3>
                <p className="text-[11px] font-medium text-gray-500">Standard English Interface</p>
              </div>
            </div>
            {selected === "en" ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Check className="h-4 w-4" />
              </div>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setSelected("te")}
            className={`w-full flex items-center justify-between rounded-3xl border p-5 transition-all shadow-xs ${
              selected === "te"
                ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold text-sm">
                తె
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-gray-900">తెలుగు (Telugu)</h3>
                <p className="text-[11px] font-medium text-gray-500">నిజమైన తెలుగు ఇంటర్‌ఫేస్</p>
              </div>
            </div>
            {selected === "te" ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Check className="h-4 w-4" />
              </div>
            ) : null}
          </button>
        </div>
      </Container>

      <Container className="max-w-md">
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
