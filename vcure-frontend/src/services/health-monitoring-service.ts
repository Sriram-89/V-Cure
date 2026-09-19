import { apiClient } from "@/lib/api-client";
import { demoShowcaseService } from "@/lib/demo-showcase-service";
import { useAuthStore } from "@/store/auth-store";

export type HealthMetricType = "BLOOD_GLUCOSE" | "HBA1C" | "BLOOD_PRESSURE" | "WEIGHT";
export type GlucoseContext = "FASTING" | "POST_MEAL" | "RANDOM" | "BEDTIME" | "GENERAL";

export interface CreateHealthReadingPayload {
  metricType: HealthMetricType;
  value: number;
  secondaryValue?: number;
  unit: string;
  context?: GlucoseContext;
  notes?: string;
  recordedAt?: string;
}

export interface HealthReadingItem {
  id: string;
  userId: string;
  metricType: HealthMetricType;
  value: number;
  secondaryValue?: number;
  unit: string;
  context?: GlucoseContext;
  notes?: string;
  recordedAt: string;
  createdAt: string;
}

export const healthMonitoringService = {
  logReading: (payload: CreateHealthReadingPayload) =>
    apiClient.post<HealthReadingItem>("/health-readings", payload),

  getReadings: async (params?: { metricType?: HealthMetricType; days?: number }): Promise<HealthReadingItem[]> => {
    const activeUser = useAuthStore.getState().user;
    if (activeUser && demoShowcaseService.isDemoUser(activeUser.id)) {
      const allLogs = demoShowcaseService.getDemoHealthLogs(activeUser.id);
      let filtered = allLogs;
      if (params?.metricType) {
        filtered = filtered.filter((l: any) => l.metricType === params.metricType);
      }
      return filtered as HealthReadingItem[];
    }

    const query = new URLSearchParams();
    if (params?.metricType) query.append("metricType", params.metricType);
    if (params?.days) query.append("days", params.days.toString());
    const queryString = query.toString();
    try {
      return await apiClient.get<HealthReadingItem[]>(
        `/health-readings${queryString ? `?${queryString}` : ""}`
      );
    } catch {
      return [];
    }
  }
};

