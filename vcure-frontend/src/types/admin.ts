// Admin module types.
// Every field here maps to a "Returns"/"Request" list actually documented
// in Development_Layer.docx API 65-75, or to a table/responsibility named
// in AI_Design.docx §60 (Admin Dashboard) or Development_Layer.docx §16
// (Admin Module). Nothing here adds fields, KPIs, or capabilities beyond
// what's named in those sections.

// API 66: GET /api/v1/admin/dashboard — Returns: Users, Revenue,
// Subscriptions, Reports, System Status.
export type SystemStatus = "OPERATIONAL" | "DEGRADED" | "DOWN";

export interface AdminDashboardSummary {
  userCount: number;
  revenue: number;
  subscriptionCount: number;
  reportCount: number;
  systemStatus: SystemStatus;
}

// API 68: PATCH /api/v1/admin/users/{id}/status — Purpose: Suspend,
// Activate, Block.
export type AdminUserStatus = "ACTIVE" | "SUSPENDED" | "BLOCKED";

// API 67: GET /api/v1/admin/users — Supports: Search, Pagination, Filters.
// Reuses the shape of the existing AuthUserDto (id, fullName, email, role)
// rather than a parallel user model, extended only with the admin-specific
// status field from API 68.
export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "PREMIUM" | "ADMIN";
  status: AdminUserStatus;
  createdAt: string;
}

export interface AdminUserFilters {
  query?: string;
  role?: AdminUserListItem["role"];
  status?: AdminUserStatus;
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// APIs 69-72: Food/Recipe/Article/Video Management — each documents only
// POST/PUT/DELETE, no GET listing endpoint. A single generic shape is used
// for all four content types since none of them have a documented
// field-level contract either — only "Food/Recipe/Article/Video" as the
// resource name. isPublished is the minimum state needed to make delete
// vs. unpublish meaningfully different in the UI.
export type AdminContentType = "FOOD" | "RECIPE" | "ARTICLE" | "VIDEO";

export interface AdminContentItem {
  id: string;
  type: AdminContentType;
  title: string;
  isPublished: boolean;
  updatedAt: string;
}

export interface AdminContentInput {
  title: string;
  isPublished: boolean;
}

// API 73: GET/PUT /api/v1/admin/settings. No field-level contract is
// documented for this endpoint. The only settings-shaped content actually
// named in the bible is the feature-flag list in Development_Layer.docx
// §66 ("Enable / Disable: Beta Features, AI Experiments, Premium Features,
// Future Modules — No redeployment required"), so that list is what's
// implemented here rather than inventing unrelated settings fields.
export type FeatureFlagKey = "BETA_FEATURES" | "AI_EXPERIMENTS" | "PREMIUM_FEATURES" | "FUTURE_MODULES";

export interface FeatureFlag {
  key: FeatureFlagKey;
  label: string;
  isEnabled: boolean;
}

// API 74: GET /api/v1/admin/audit-logs — Supports: Date Filter, User
// Filter, Action Filter. Field names (Old Value, New Value, User,
// Timestamp, Reason) come from Data_Layer.docx §34 "Audit Record Format".
export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  timestamp: string;
}

export interface AuditLogFilters {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  action?: string;
}

// API 75: GET /api/v1/admin/analytics — Returns exactly these six metrics.
export interface SystemAnalytics {
  dailyActiveUsers: { date: string; value: number }[];
  monthlyActiveUsers: number;
  retentionPercent: number;
  mealCompletionPercent: number;
  recommendationAcceptancePercent: number;
  healthScoreTrend: { date: string; value: number }[];
}
