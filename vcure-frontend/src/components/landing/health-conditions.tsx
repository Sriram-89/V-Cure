import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

const CONDITIONS = [
  "Type 2 Diabetes",
  "Hypertension",
  "PCOS",
  "Thyroid disorders",
  "High cholesterol",
  "Chronic kidney disease",
  "IBS",
  "Food allergies"
];

export function HealthConditions() {
  return (
    <section id="conditions" className="bg-surface-muted py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary">Clinically informed</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Built to work around real conditions
          </h2>
          <p className="mt-4 text-text-secondary">
            Every plan accounts for the conditions and medications already in your
            profile, not just your goals.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {CONDITIONS.map((condition) => (
            <span
              key={condition}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-primary"
            >
              {condition}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
