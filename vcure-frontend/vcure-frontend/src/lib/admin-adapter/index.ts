import type { AdminAdapter } from "@/lib/admin-adapter/types";
import { mockAdminAdapter } from "@/lib/admin-adapter/mock-adapter";

// TODO(backend): real endpoints are documented as API 65-75 (Development_Layer.docx
// §Admin & System API Contracts): admin/login, admin/dashboard, admin/users,
// admin/users/{id}/status, admin/foods|recipes|articles|videos,
// admin/settings, admin/audit-logs, admin/analytics. Once live, implement a
// RealAdminAdapter against apiClient hitting those exact paths and swap it
// in here. Note: content listing (getContent) has no documented GET
// endpoint — see the note in mock-adapter.ts before wiring a real one.
export const adminAdapter: AdminAdapter = mockAdminAdapter;

export type { AdminAdapter } from "@/lib/admin-adapter/types";
