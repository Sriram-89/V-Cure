import type { CurrentSubscription, PaymentResult, UpgradeRequest } from "@/types/premium";

export interface PremiumAdapter {
  // Maps to API 62: GET /api/v1/subscription
  getSubscription(): Promise<CurrentSubscription>;
  // Maps to API 63 (initiates checkout) + API 64 (payment webhook simulated
  // client-side here, since there is no real payment gateway integrated).
  // Real integration would redirect to a payment gateway and receive API 64
  // as a server-side webhook; this mock simulates that round trip.
  upgrade(request: UpgradeRequest): Promise<PaymentResult>;
}
