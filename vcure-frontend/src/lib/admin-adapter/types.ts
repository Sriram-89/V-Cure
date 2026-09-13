import type {
  AdminContentInput,
  AdminContentItem,
  AdminContentType,
  AdminDashboardSummary,
  AdminUserFilters,
  AdminUserListItem,
  AdminUserStatus,
  AuditLogEntry,
  AuditLogFilters,
  FeatureFlag,
  FeatureFlagKey,
  PaginatedResult,
  SystemAnalytics
} from "@/types/admin";

export interface AdminAdapter {
  // API 66: GET /api/v1/admin/dashboard
  getDashboardSummary(): Promise<AdminDashboardSummary>;

  // API 67: GET /api/v1/admin/users (search, pagination, filters)
  getUsers(filters: AdminUserFilters): Promise<PaginatedResult<AdminUserListItem>>;
  // API 68: PATCH /api/v1/admin/users/{id}/status
  updateUserStatus(userId: string, status: AdminUserStatus): Promise<AdminUserListItem>;

  // APIs 69-72: Food/Recipe/Article/Video Management (POST/PUT/DELETE only
  // — listing is not part of the documented contract; see mock-adapter.ts
  // for how that gap is handled).
  getContent(type: AdminContentType): Promise<AdminContentItem[]>;
  createContent(type: AdminContentType, input: AdminContentInput): Promise<AdminContentItem>;
  updateContent(
    type: AdminContentType,
    id: string,
    input: AdminContentInput
  ): Promise<AdminContentItem>;
  deleteContent(type: AdminContentType, id: string): Promise<void>;

  // API 73: GET/PUT /api/v1/admin/settings — modeled as the documented
  // feature-flag list (see types/admin.ts for the grounding note).
  getFeatureFlags(): Promise<FeatureFlag[]>;
  updateFeatureFlag(key: FeatureFlagKey, isEnabled: boolean): Promise<FeatureFlag>;

  // API 74: GET /api/v1/admin/audit-logs
  getAuditLogs(filters: AuditLogFilters): Promise<AuditLogEntry[]>;

  // API 75: GET /api/v1/admin/analytics
  getAnalytics(): Promise<SystemAnalytics>;
}
