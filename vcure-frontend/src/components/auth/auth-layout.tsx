import Link from "next/link";
import { VCureSymbolLogo, VCureWordmarkLogo } from "@/components/ui/vcure-logo";
import { ROUTES } from "@/constants/routes";

export function AuthLayout({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-900/90 flex flex-col items-center justify-center p-0 sm:py-6">
      <div className="relative w-full max-w-[430px] min-h-screen sm:min-h-[840px] sm:max-h-[920px] bg-gray-50 sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/80 overflow-x-hidden flex flex-col justify-between">
        {/* Green Header Section with V-Cure Logo */}
        <div className="relative flex flex-col items-center justify-center bg-gradient-to-b from-emerald-800 via-emerald-600 to-emerald-700 py-12 px-4 text-center text-white">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2.5 shadow-lg border border-white/40">
            <VCureSymbolLogo className="h-full w-full" />
          </div>
          <div className="mt-3 flex items-center justify-center">
            <VCureWordmarkLogo variant="light" className="h-7 w-auto" />
          </div>
          <p className="mt-1.5 text-xs font-medium text-emerald-100/90 tracking-wider">
            Smarter Nutrition, Healthier Life
          </p>
        </div>

        {/* Floating White Card Container */}
        <div className="relative -mt-6 flex-1 rounded-t-[36px] bg-white px-6 py-8 shadow-2xl">
          <div className="mx-auto w-full">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-xs font-medium text-gray-500">{subtitle}</p>
            ) : null}

            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
