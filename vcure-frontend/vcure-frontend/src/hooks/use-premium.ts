import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { premiumService } from "@/services/premium-service";
import type { UpgradeRequest } from "@/types/premium";

const SUBSCRIPTION_QUERY_KEY = ["premium", "subscription"];

export function useSubscription() {
  return useQuery({ queryKey: SUBSCRIPTION_QUERY_KEY, queryFn: premiumService.getSubscription });
}

export function useUpgradeSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpgradeRequest) => premiumService.upgrade(request),
    onSuccess: (result) => {
      if (result.outcome === "SUCCESS") {
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
      }
    }
  });
}
