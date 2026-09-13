"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackUrl?: string;
  className?: string;
  label?: string;
}

export function BackButton({ fallbackUrl = "/dashboard", className = "", label }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-emerald-700 transition-colors ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
      {label ? <span>{label}</span> : null}
    </button>
  );
}
