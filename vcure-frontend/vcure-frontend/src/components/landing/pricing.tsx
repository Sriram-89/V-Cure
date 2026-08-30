import Link from "next/link";
import { Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { PLANS } from "@/constants/plans";

export function Pricing() {
  return (
    <section id="pricing" className="py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Simple pricing
          </h2>
          <p className="mt-4 text-text-secondary">
            Start free. Upgrade only when you want deeper tracking and coaching.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.code}
              className="flex flex-col rounded-card border border-border p-8 shadow-card"
            >
              <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
              <p className="mt-2 text-sm text-text-secondary">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-text-primary">
                  {plan.price}
                </span>
                <span className="text-sm text-text-secondary">{plan.period}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-text-primary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href={plan.code === "FREE" ? ROUTES.REGISTER : ROUTES.PREMIUM} className="mt-8">
                <Button variant={plan.code === "FREE" ? "outline" : "primary"} className="w-full">
                  {plan.code === "FREE" ? "Start for free" : "Upgrade to Premium"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
