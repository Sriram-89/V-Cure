import { premiumAdapter } from "@/lib/premium-adapter";
import type { UpgradeRequest } from "@/types/premium";

export const premiumService = {
  getSubscription: () => premiumAdapter.getSubscription(),
  upgrade: (request: UpgradeRequest) => premiumAdapter.upgrade(request)
};
