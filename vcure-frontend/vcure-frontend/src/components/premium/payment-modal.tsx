"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2, XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/input-field";
import { SelectField } from "@/components/ui/select-field";
import { getPlan, type PlanCode } from "@/constants/plans";
import { useUpgradeSubscription } from "@/hooks/use-premium";
import type { PaymentMethod } from "@/types/premium";

const PAYMENT_METHOD_OPTIONS = [
  { value: "CARD", label: "Card" },
  { value: "UPI", label: "UPI" },
  { value: "NET_BANKING", label: "Net banking" }
];

export function PaymentModal({
  planCode,
  onClose
}: {
  planCode: PlanCode;
  onClose: () => void;
}) {
  const plan = getPlan(planCode);
  const upgrade = useUpgradeSubscription();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [couponCode, setCouponCode] = useState("");

  const handlePay = () => {
    upgrade.mutate({ planCode, paymentMethod, couponCode: couponCode || undefined });
  };

  const handleRetry = () => {
    upgrade.reset();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div className="w-full max-w-sm rounded-card bg-surface p-6 shadow-modal">
        <div className="flex items-center justify-between">
          <h2 id="payment-modal-title" className="text-base font-semibold text-text-primary">
            {upgrade.data?.outcome === "SUCCESS" ? "Payment successful" : "Payment"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-md p-1 text-text-secondary hover:bg-surface-muted"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {upgrade.data?.outcome === "SUCCESS" ? (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" aria-hidden="true" />
            <p className="text-sm text-text-primary">
              You&apos;re now on {plan.name}. Invoice{" "}
              <span className="font-mono text-xs">{upgrade.data.invoiceId}</span> has been created.
            </p>
            <Button type="button" className="w-full" onClick={onClose}>
              Go to Premium Dashboard
            </Button>
          </div>
        ) : upgrade.data?.outcome === "FAILED" ? (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <XCircle className="h-10 w-10 text-danger" aria-hidden="true" />
            <p className="text-sm text-danger" role="alert">
              {upgrade.data.failureReason ?? "Payment failed. Please try again."}
            </p>
            <div className="flex w-full gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" className="flex-1" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-md bg-surface-muted p-3 text-sm">
              <span className="text-text-secondary">Plan</span>
              <span className="font-medium text-text-primary">
                {plan.name} — {plan.price}
                {plan.period}
              </span>
            </div>

            <SelectField
              label="Payment method"
              options={PAYMENT_METHOD_OPTIONS}
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            />

            <InputField
              label="Coupon code (optional)"
              placeholder="e.g. WELCOME10"
              value={couponCode}
              onChange={(event) => setCouponCode(event.target.value)}
            />

            <p className="flex items-center gap-1.5 text-xs text-text-secondary">
              <CreditCard className="h-3.5 w-3.5" aria-hidden="true" />
              This is a mock checkout — no real payment is processed.
            </p>

            {upgrade.isError ? (
              <p role="alert" className="text-xs text-danger">
                Something went wrong starting checkout. Please try again.
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handlePay}
                isLoading={upgrade.isPending}
              >
                Pay & subscribe
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
