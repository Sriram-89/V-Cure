import { Container } from "@/components/ui/container";
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import { VCureWordmarkLogo } from "@/components/ui/vcure-logo";
import type { OnboardingStep } from "@/types/onboarding";

export function OnboardingLayout({
  currentStep,
  title,
  subtitle,
  children
}: {
  currentStep: OnboardingStep;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-900/90 flex flex-col items-center justify-center p-0 sm:py-6">
      <div className="relative w-full max-w-[430px] min-h-screen sm:min-h-[840px] sm:max-h-[920px] bg-gray-50 sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/80 overflow-x-hidden flex flex-col py-6 px-4">
        <div className="flex items-center justify-center pb-3">
          <VCureWordmarkLogo className="h-6 w-auto" />
        </div>
        <ProgressIndicator currentStep={currentStep} />

        <div className="mt-6 flex-1 rounded-3xl border border-gray-100 bg-white p-5 shadow-lg">
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>

          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
