import { Container } from "@/components/ui/container";
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
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
    <div className="min-h-screen bg-surface-muted py-10">
      <Container className="max-w-2xl">
        <ProgressIndicator currentStep={currentStep} />

        <div className="mt-8 rounded-card border border-border bg-surface p-6 shadow-card sm:p-8">
          <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
          <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </div>
      </Container>
    </div>
  );
}
