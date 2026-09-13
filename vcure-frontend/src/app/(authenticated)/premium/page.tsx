"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { CurrentPlanCard } from "@/components/premium/current-plan-card";
import { PlanComparison } from "@/components/premium/plan-comparison";
import { PaymentModal } from "@/components/premium/payment-modal";
import type { PlanCode } from "@/constants/plans";

export default function PremiumPage() {
  const [selectedPlanCode, setSelectedPlanCode] = useState<PlanCode | null>(null);

  return (
    <Container className="max-w-3xl py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Subscription</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Manage your plan and unlock Premium features.
      </p>

      <div className="mt-6 flex flex-col gap-8">
        <CurrentPlanCard />
        <PlanComparison onSelectPlan={setSelectedPlanCode} />
      </div>

      {selectedPlanCode ? (
        <PaymentModal planCode={selectedPlanCode} onClose={() => setSelectedPlanCode(null)} />
      ) : null}
    </Container>
  );
}
