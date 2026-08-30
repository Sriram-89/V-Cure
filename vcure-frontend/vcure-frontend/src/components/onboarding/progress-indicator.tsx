import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { ONBOARDING_STEPS, type OnboardingStep } from "@/types/onboarding";

const STEP_LABELS: Record<OnboardingStep, string> = {
  "personal-info": "Personal info",
  "health-profile": "Health",
  "medical-profile": "Medical",
  lifestyle: "Lifestyle",
  goals: "Goals",
  review: "Review"
};

export function ProgressIndicator({ currentStep }: { currentStep: OnboardingStep }) {
  const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);

  return (
    <ol
      className="flex items-center gap-2 overflow-x-auto pb-2"
      aria-label="Onboarding progress"
    >
      {ONBOARDING_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  isCompleted && "border-primary bg-primary text-white",
                  isCurrent && "border-primary text-primary",
                  !isCompleted && !isCurrent && "border-border text-text-secondary"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </span>
              <span className="hidden text-xs text-text-secondary sm:block">
                {STEP_LABELS[step]}
              </span>
            </div>
            {index < ONBOARDING_STEPS.length - 1 ? (
              <span
                className={cn(
                  "h-px flex-1",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
