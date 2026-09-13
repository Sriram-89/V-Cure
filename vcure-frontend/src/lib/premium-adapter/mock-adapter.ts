import type { PremiumAdapter } from "@/lib/premium-adapter/types";
import type { CurrentSubscription, PaymentResult, UpgradeRequest } from "@/types/premium";
import { getPlan } from "@/constants/plans";

const SIMULATED_LATENCY_MS = 700;

function delay<T>(value: T, ms = SIMULATED_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let currentSubscription: CurrentSubscription = {
  planCode: "FREE",
  status: "NONE",
  expiresAt: null,
  features: getPlan("FREE").features
};

export const mockPremiumAdapter: PremiumAdapter = {
  async getSubscription() {
    return delay({ ...currentSubscription });
  },

  async upgrade(request: UpgradeRequest): Promise<PaymentResult> {
    // No real payment gateway is integrated (none is named in the
    // Engineering Bible). This simulates the "Payment Gateway → Payment
    // Success/Failed" step from Use Case 29 with a coin-flip-free,
    // deterministic-for-testing rule: a coupon code of "FAIL" simulates a
    // declined payment; everything else succeeds, matching the documented
    // Payment Failed → Retry → Cancel alternate flow.
    const result = await delay(undefined, 1200);
    void result;

    if (request.couponCode?.toUpperCase() === "FAIL") {
      return {
        outcome: "FAILED",
        failureReason: "Your payment method was declined. Please try again."
      };
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    currentSubscription = {
      planCode: request.planCode,
      status: "ACTIVE",
      expiresAt: expiresAt.toISOString(),
      features: getPlan(request.planCode).features
    };

    return {
      outcome: "SUCCESS",
      subscription: { ...currentSubscription },
      invoiceId: `INV-${Date.now()}`
    };
  }
};
