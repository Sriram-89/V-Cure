import type { PlanCode } from "@/constants/plans";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "NONE";

// Maps to API 62 (GET /api/v1/subscription) "Returns": Current Plan, Expiry, Features.
export interface CurrentSubscription {
  planCode: PlanCode;
  status: SubscriptionStatus;
  expiresAt: string | null;
  features: string[];
}

export type PaymentMethod = "CARD" | "UPI" | "NET_BANKING";

// Maps to API 63 (POST /api/v1/subscription/upgrade) "Request": Plan, Payment Method, Coupon Code.
export interface UpgradeRequest {
  planCode: PlanCode;
  paymentMethod: PaymentMethod;
  couponCode?: string;
}

export type PaymentOutcome = "SUCCESS" | "FAILED";

// Maps to API 64 (POST /api/v1/payment/webhook) business rules: Verify
// Signature, Activate Plan, Create Invoice.
export interface PaymentResult {
  outcome: PaymentOutcome;
  subscription?: CurrentSubscription;
  invoiceId?: string;
  failureReason?: string;
}
