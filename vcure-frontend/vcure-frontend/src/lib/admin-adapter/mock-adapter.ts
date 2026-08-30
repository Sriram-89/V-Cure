import type { AdminAdapter } from "@/lib/admin-adapter/types";
import type {
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

const SIMULATED_LATENCY_MS = 350;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

let users: AdminUserListItem[] = [
  { id: "u1", fullName: "Sriram K", email: "sriram@example.com", role: "PREMIUM", status: "ACTIVE", createdAt: daysAgo(120) },
  { id: "u2", fullName: "Ananya Rao", email: "ananya@example.com", role: "USER", status: "ACTIVE", createdAt: daysAgo(80) },
  { id: "u3", fullName: "Rahul Verma", email: "rahul@example.com", role: "USER", status: "SUSPENDED", createdAt: daysAgo(60) },
  { id: "u4", fullName: "Priya Nair", email: "priya@example.com", role: "PREMIUM", status: "ACTIVE", createdAt: daysAgo(30) },
  { id: "u5", fullName: "Test Blocked", email: "blocked@example.com", role: "USER", status: "BLOCKED", createdAt: daysAgo(10) }
];

// NOTE ON SCOPE GAP: API 69-72 (Food/Recipe/Article/Video Management) only
// document POST/PUT/DELETE — no GET listing endpoint. An admin content
// table is unusable without a list, so this mock adds an in-memory list
// purely to make the documented create/update/delete actions operable in
// the UI. This is explicitly NOT part of the documented contract — flagged
// here and in ADMIN.md so it isn't mistaken for a real endpoint later.
let content: AdminContentItem[] = [
  { id: "f1", type: "FOOD", title: "Brown Rice (100g)", isPublished: true, updatedAt: daysAgo(5) },
  { id: "f2", type: "FOOD", title: "Paneer (100g)", isPublished: true, updatedAt: daysAgo(12) },
  { id: "r1", type: "RECIPE", title: "Vegetable Quinoa Power Bowl", isPublished: true, updatedAt: daysAgo(3) },
  { id: "r2", type: "RECIPE", title: "Red Lentil Curry", isPublished: true, updatedAt: daysAgo(9) },
  { id: "a1", type: "ARTICLE", title: "Understanding the Glycemic Index", isPublished: true, updatedAt: daysAgo(2) },
  { id: "a2", type: "ARTICLE", title: "Draft: New allergy guide", isPublished: false, updatedAt: daysAgo(1) },
  { id: "v1", type: "VIDEO", title: "5-Minute Breakfast Prep", isPublished: true, updatedAt: daysAgo(20) }
];

let featureFlags: FeatureFlag[] = [
  { key: "BETA_FEATURES", label: "Beta features", isEnabled: false },
  { key: "AI_EXPERIMENTS", label: "AI experiments", isEnabled: true },
  { key: "PREMIUM_FEATURES", label: "Premium features", isEnabled: true },
  { key: "FUTURE_MODULES", label: "Future modules", isEnabled: false }
];

const auditLogs: AuditLogEntry[] = [
  { id: "log1", userId: "admin1", userName: "Admin", action: "USER_STATUS_UPDATED", oldValue: "ACTIVE", newValue: "SUSPENDED", timestamp: daysAgo(2) },
  { id: "log2", userId: "admin1", userName: "Admin", action: "CONTENT_PUBLISHED", oldValue: "false", newValue: "true", timestamp: daysAgo(4) },
  { id: "log3", userId: "admin1", userName: "Admin", action: "SETTINGS_UPDATED", oldValue: "AI_EXPERIMENTS=false", newValue: "AI_EXPERIMENTS=true", timestamp: daysAgo(7) }
];

function seededSeries(days: number, base: number, amplitude: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = days - 1 - i;
    return { date: daysAgo(d), value: Math.round(base + Math.sin(d) * amplitude) };
  });
}

export const mockAdminAdapter: AdminAdapter = {
  async getDashboardSummary(): Promise<AdminDashboardSummary> {
    return delay({
      userCount: users.length,
      revenue: 24500,
      subscriptionCount: users.filter((u) => u.role === "PREMIUM").length,
      reportCount: 3,
      systemStatus: "OPERATIONAL"
    });
  },

  async getUsers(filters: AdminUserFilters): Promise<PaginatedResult<AdminUserListItem>> {
    let results = users;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter(
        (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    if (filters.role) results = results.filter((u) => u.role === filters.role);
    if (filters.status) results = results.filter((u) => u.status === filters.status);

    const start = (filters.page - 1) * filters.pageSize;
    const page = results.slice(start, start + filters.pageSize);

    return delay({ items: page, totalCount: results.length, page: filters.page, pageSize: filters.pageSize });
  },

  async updateUserStatus(userId, status) {
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error(`User ${userId} not found`);
    user.status = status;
    return delay({ ...user });
  },

  async getContent(type: AdminContentType) {
    return delay(content.filter((c) => c.type === type));
  },

  async createContent(type, input) {
    const item: AdminContentItem = {
      id: `${type.toLowerCase()}-${Date.now()}`,
      type,
      title: input.title,
      isPublished: input.isPublished,
      updatedAt: new Date().toISOString()
    };
    content = [item, ...content];
    return delay(item);
  },

  async updateContent(type, id, input) {
    const item = content.find((c) => c.id === id && c.type === type);
    if (!item) throw new Error(`${type} ${id} not found`);
    item.title = input.title;
    item.isPublished = input.isPublished;
    item.updatedAt = new Date().toISOString();
    return delay({ ...item });
  },

  async deleteContent(type, id) {
    content = content.filter((c) => !(c.id === id && c.type === type));
    return delay(undefined);
  },

  async getFeatureFlags() {
    return delay([...featureFlags]);
  },

  async updateFeatureFlag(key, isEnabled) {
    featureFlags = featureFlags.map((f) => (f.key === key ? { ...f, isEnabled } : f));
    return delay(featureFlags.find((f) => f.key === key)!);
  },

  async getAuditLogs(filters: AuditLogFilters) {
    let results = auditLogs;
    if (filters.action) results = results.filter((l) => l.action === filters.action);
    if (filters.userId) results = results.filter((l) => l.userId === filters.userId);
    if (filters.dateFrom) results = results.filter((l) => l.timestamp >= filters.dateFrom!);
    if (filters.dateTo) results = results.filter((l) => l.timestamp <= filters.dateTo!);
    return delay(results);
  },

  async getAnalytics(): Promise<SystemAnalytics> {
    return delay({
      dailyActiveUsers: seededSeries(14, 320, 40),
      monthlyActiveUsers: 4200,
      retentionPercent: 62,
      mealCompletionPercent: 71,
      recommendationAcceptancePercent: 84,
      healthScoreTrend: seededSeries(14, 68, 5)
    });
  }
};
