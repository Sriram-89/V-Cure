# Admin Dashboard — Module Documentation

## Grounding

Implemented strictly against:
- **Development_Layer.docx** — "Admin & System API Contracts" (API 65–75), §16 Admin Module responsibilities, §22/§23 Admin Layout / Admin Store.
- **AI_Design.docx** — §60 Admin Dashboard nav list, §17–19 security headers/logging (informed the audit-log field choice).
- **Data_Layer.docx** — §34 Audit Record Format (oldValue/newValue/user/timestamp fields).

## Routes

All under `src/app/admin/` — a **top-level segment outside** the `(authenticated)` route group, so it gets its own "Admin Layout" (per the bible's distinct Dashboard Layout / Public Layout / Admin Layout split) instead of nesting inside the main app shell's sidebar.

| Route | Page |
|---|---|
| `/admin` | Overview (API 66 KPIs) |
| `/admin/users` | User Management (API 67/68) |
| `/admin/content?type=FOOD\|RECIPE\|ARTICLE\|VIDEO` | Content Management (API 69-72) |
| `/admin/settings` | Feature flags (API 73) |
| `/admin/audit-logs` | Audit Logs (API 74) |
| `/admin/analytics` | System Analytics (API 75) |

## Adapter boundary

`src/lib/admin-adapter/{types,mock-adapter,index}.ts` — `AdminAdapter` interface methods map 1:1 to API 65–75. `mockAdminAdapter` is the only implementation today. Swap point is `admin-adapter/index.ts`; no component or hook should need to change when a real adapter is added.

## Role/permission model

Reuses the **existing** `AuthUserDto.role` union (`"USER" | "PREMIUM" | "ADMIN"`) — no parallel role model was created. `RequireAdmin` (`src/components/admin/require-admin.tsx`) checks `user.role === "ADMIN"` and redirects otherwise. The main app Sidebar shows an "Admin" link only when this is true.

**This is UI-layer protection only.** It hides/redirects in the frontend; it does not and cannot replace server-side authorization. There is no documented backend authorization contract yet (API 65 documents `POST /api/v1/admin/login` as "Admin Only" but no token-scoping/claims contract) — real enforcement must happen server-side once that exists. This is a known gap, not something the frontend can close.

## Deviations from the documented contract (flagged explicitly)

1. **Content listing (Foods/Recipes/Articles/Videos) is mock-only.** API 69–72 document only `POST`/`PUT`/`DELETE` — no `GET` list endpoint exists in the bible. A list is functionally required for an admin management table, so the mock adapter includes one, clearly commented as *not* part of the documented contract.
2. **Admin Settings (API 73)** has no documented field-level contract. The only settings-shaped content actually named anywhere in the bible is the feature-flag list in Development_Layer.docx (Beta Features / AI Experiments / Premium Features / Future Modules), so that's what's implemented — not invented settings fields.
3. **Reports** — API 66 returns only a `reportCount` on the dashboard summary. There is no documented Reports listing/detail endpoint, so no Reports page/list was built; the count is shown on Overview only.
4. **System Health** — API 66 returns only `System Status`. No CPU/memory/uptime metrics are documented for any admin endpoint, so none are shown — just the status badge.
5. **Not implemented, because not documented anywhere for an admin surface:** Notification management (the `NotificationQueue`/`Announcement` tables exist in the data model but have no admin API), AI/model monitoring, and a downgrade/cancel-subscription admin action.

## Reused (not duplicated)

- `AuthUserDto` role union (auth)
- `AdminUserListItem` reuses the same id/fullName/email shape as the rest of the app rather than a parallel user model
- `AdminDataTable`, `StatCard`, `TrendLineChart`, `Badge`, `Button`, `ConfirmDialog`, `SelectField`, `InputField` — all existing components, not re-implemented
- `RequireAuth` pattern → mirrored (not duplicated) as `RequireAdmin`

## Known limitations / pending

- **Runtime verification (tsc/eslint): PENDING.** No `node_modules` in this environment — only structural/manual review was performed (import resolution, duplicate-definition grep, route-collision scan — all clean, see below).
- Backend authorization contract for `/api/v1/admin/*` is not documented beyond "Admin Only" on login — real enforcement is a backend integration task, not a frontend one.
