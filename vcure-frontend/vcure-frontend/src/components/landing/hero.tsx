import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface-muted">
      <Container className="grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <Badge variant="primary">Built around your medical history</Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            A nutrition plan that already knows your conditions.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-text-secondary">
            V-Cure reads your medical reports, allergies, and lifestyle, then
            builds meal and habit recommendations your doctor would recognize
            — with every unsafe interaction flagged before it reaches you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={ROUTES.REGISTER}>
              <Button size="lg" className="w-full sm:w-auto">
                Start your health profile
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See how it works
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-2 text-sm text-text-secondary">
            <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
            Every recommendation passes a clinical safety layer before you see it.
          </div>
        </div>

        <div className="relative">
          <div className="rounded-card border border-border bg-surface p-6 shadow-card">
            <p className="text-sm font-medium text-text-secondary">Today&apos;s plan</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-md bg-surface-muted p-3">
                <span className="text-sm text-text-primary">Breakfast · Oats &amp; berries</span>
                <Badge variant="primary">Safe</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md bg-surface-muted p-3">
                <span className="text-sm text-text-primary">Lunch · Grilled paneer bowl</span>
                <Badge variant="primary">Safe</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md bg-surface-muted p-3">
                <span className="text-sm text-text-primary">Snack · Salted peanuts</span>
                <Badge variant="secondary">Flagged — allergy match</Badge>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
