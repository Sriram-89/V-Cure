// Plan data shared between the public landing page (Pricing section) and
// the authenticated Premium module. The Engineering Bible documents the
// existence of a Free/Premium tier (RBAC roles: User, Premium User) and the
// upgrade flow (Data_Layer.docx Use Case 29), but does not specify plan
// names, pricing, or a benefits list. "Free" / "Premium" are the only tier
// names used (matching the documented RBAC roles). The price and feature
// list below are placeholder mock data pending real product/business input
// — not sourced from the bible — and are clearly labeled as such everywhere
// they're used.
export type PlanCode = "FREE" | "PREMIUM";

export interface Plan {
  code: PlanCode;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
}

export const PLANS: Plan[] = [
  {
    code: "FREE",
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Enough to build your health profile and get your first plan.",
    features: [
      "Health & medical profile",
      "Basic meal recommendations",
      "Manual meal logging",
      "Safety layer on every suggestion"
    ]
  },
  {
    code: "PREMIUM",
    name: "Premium",
    price: "₹499",
    period: "/ month",
    description: "For ongoing tracking, deeper insights, and priority support.",
    features: [
      "Everything in Free",
      "AI health coach chat",
      "Progress trends & reports",
      "Shopping list generation",
      "Priority support"
    ]
  }
];

export function getPlan(code: PlanCode): Plan {
  const plan = PLANS.find((p) => p.code === code);
  if (!plan) throw new Error(`Unknown plan code: ${code}`);
  return plan;
}
