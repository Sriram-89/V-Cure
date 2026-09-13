import type { PremiumAdapter } from "@/lib/premium-adapter/types";
import { mockPremiumAdapter } from "@/lib/premium-adapter/mock-adapter";

// TODO(backend): the real endpoints are already documented —
// GET /api/v1/subscription (API 62), POST /api/v1/subscription/upgrade
// (API 63), and POST /api/v1/payment/webhook (API 64, server-side only).
// Once a real payment gateway is selected and integrated, implement a
// RealPremiumAdapter against apiClient hitting API 62/63 and swap it in
// here. No component or hook in src/components/premium or
// src/hooks/use-premium.ts should need to change.
export const premiumAdapter: PremiumAdapter = mockPremiumAdapter;

export type { PremiumAdapter } from "@/lib/premium-adapter/types";
