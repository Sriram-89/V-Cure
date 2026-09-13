import { FileText, Brain, ShieldCheck, LineChart } from "lucide-react";
import { Container } from "@/components/ui/container";

const STEPS = [
  {
    icon: FileText,
    title: "Upload your reports",
    description:
      "Add lab reports and prescriptions. V-Cure extracts conditions, medications, and allergies automatically."
  },
  {
    icon: Brain,
    title: "Get a plan built for you",
    description:
      "The recommendation engine combines your medical history and lifestyle into a personalized nutrition plan."
  },
  {
    icon: ShieldCheck,
    title: "Every suggestion is checked",
    description:
      "A dedicated safety layer screens each recommendation against your allergies and conditions first."
  },
  {
    icon: LineChart,
    title: "Track what changes",
    description:
      "Log meals and vitals, and watch your health trends move alongside your plan over time."
  }
];

export function Features() {
  return (
    <section id="how-it-works" className="py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            How V-Cure works
          </h2>
          <p className="mt-4 text-text-secondary">
            Four steps between your first upload and a plan you can trust.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.title} className="rounded-card border border-border p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary-50 text-primary">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold text-text-primary">{step.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
