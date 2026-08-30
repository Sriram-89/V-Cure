import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin-service";
import type {
  AdminContentInput,
  AdminContentType,
  AdminUserFilters,
  AdminUserStatus,
  AuditLogFilters,
  FeatureFlagKey
} from "@/types/admin";

export function useAdminDashboardSummary() {
  return useQuery({ queryKey: ["admin", "dashboard"], queryFn: adminService.getDashboardSummary });
}

export function useAdminUsers(filters: AdminUserFilters) {
  return useQuery({ queryKey: ["admin", "users", filters], queryFn: () => adminService.getUsers(filters) });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: AdminUserStatus }) =>
      adminService.updateUserStatus(userId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
  });
}

export function useAdminContent(type: AdminContentType) {
  return useQuery({ queryKey: ["admin", "content", type], queryFn: () => adminService.getContent(type) });
}

export function useCreateAdminContent(type: AdminContentType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AdminContentInput) => adminService.createContent(type, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "content", type] })
  });
}

export function useUpdateAdminContent(type: AdminContentType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AdminContentInput }) =>
      adminService.updateContent(type, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "content", type] })
  });
}

export function useDeleteAdminContent(type: AdminContentType) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteContent(type, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "content", type] })
  });
}

export function useFeatureFlags() {
  return useQuery({ queryKey: ["admin", "feature-flags"], queryFn: adminService.getFeatureFlags });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, isEnabled }: { key: FeatureFlagKey; isEnabled: boolean }) =>
      adminService.updateFeatureFlag(key, isEnabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "feature-flags"] })
  });
}

export function useAuditLogs(filters: AuditLogFilters) {
  return useQuery({ queryKey: ["admin", "audit-logs", filters], queryFn: () => adminService.getAuditLogs(filters) });
}

export function useAdminAnalytics() {
  return useQuery({ queryKey: ["admin", "analytics"], queryFn: adminService.getAnalytics });
}
