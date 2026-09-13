import { adminAdapter } from "@/lib/admin-adapter";
import type {
  AdminContentInput,
  AdminContentType,
  AdminUserFilters,
  AdminUserStatus,
  AuditLogFilters,
  FeatureFlagKey
} from "@/types/admin";

export const adminService = {
  getDashboardSummary: () => adminAdapter.getDashboardSummary(),
  getUsers: (filters: AdminUserFilters) => adminAdapter.getUsers(filters),
  updateUserStatus: (userId: string, status: AdminUserStatus) =>
    adminAdapter.updateUserStatus(userId, status),
  getContent: (type: AdminContentType) => adminAdapter.getContent(type),
  createContent: (type: AdminContentType, input: AdminContentInput) =>
    adminAdapter.createContent(type, input),
  updateContent: (type: AdminContentType, id: string, input: AdminContentInput) =>
    adminAdapter.updateContent(type, id, input),
  deleteContent: (type: AdminContentType, id: string) => adminAdapter.deleteContent(type, id),
  getFeatureFlags: () => adminAdapter.getFeatureFlags(),
  updateFeatureFlag: (key: FeatureFlagKey, isEnabled: boolean) =>
    adminAdapter.updateFeatureFlag(key, isEnabled),
  getAuditLogs: (filters: AuditLogFilters) => adminAdapter.getAuditLogs(filters),
  getAnalytics: () => adminAdapter.getAnalytics()
};
