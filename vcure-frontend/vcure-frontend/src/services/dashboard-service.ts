import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api";
import type { DashboardSummaryDto } from "@/types/dashboard";

export const dashboardService = {
  getSummary: () => apiClient.get<DashboardSummaryDto>(API_ENDPOINTS.DASHBOARD)
};
