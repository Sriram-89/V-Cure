"use client";

import { Search } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { AdminDataTable, type AdminTableColumn } from "@/components/admin/admin-data-table";
import { UserStatusActions } from "@/components/admin/user-status-actions";
import { useAdminUsers } from "@/hooks/use-admin";
import { useAdminStore } from "@/store/admin-store";
import type { AdminUserListItem } from "@/types/admin";

const ROLE_OPTIONS = [
  { value: "USER", label: "User" },
  { value: "PREMIUM", label: "Premium" },
  { value: "ADMIN", label: "Admin" }
];
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "BLOCKED", label: "Blocked" }
];

function statusBadgeVariant(status: AdminUserListItem["status"]) {
  if (status === "ACTIVE") return "primary" as const;
  if (status === "SUSPENDED") return "secondary" as const;
  return "neutral" as const;
}

const columns: AdminTableColumn<AdminUserListItem>[] = [
  { key: "fullName", label: "Name", render: (row) => row.fullName },
  { key: "email", label: "Email", render: (row) => row.email },
  { key: "role", label: "Role", render: (row) => <Badge variant="neutral">{row.role}</Badge> },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span className="flex items-center gap-1.5">
        <Badge variant={statusBadgeVariant(row.status)}>{row.status}</Badge>
      </span>
    )
  }
];

export default function AdminUsersPage() {
  const filters = useAdminStore((state) => state.userFilters);
  const setFilters = useAdminStore((state) => state.setUserFilters);
  const { data, isLoading, isError, refetch } = useAdminUsers(filters);

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / filters.pageSize)) : 1;

  return (
    <Container className="max-w-6xl py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Users</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Search, filter, and manage account status (API 67 / API 68).
      </p>

      <div className="mt-6 rounded-card border border-border bg-surface p-6 shadow-card">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative sm:col-span-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filters.query ?? ""}
              onChange={(event) => setFilters({ ...filters, query: event.target.value, page: 1 })}
              placeholder="Search name or email"
              aria-label="Search users"
              className="h-11 w-full rounded-input border border-border bg-surface pl-9 pr-3 text-sm text-text-primary focus-visible:border-primary"
            />
          </div>
          <SelectField
            label="Role"
            placeholder="Any role"
            options={ROLE_OPTIONS}
            value={filters.role ?? ""}
            onChange={(event) =>
              setFilters({ ...filters, role: (event.target.value || undefined) as AdminUserListItem["role"], page: 1 })
            }
          />
          <SelectField
            label="Status"
            placeholder="Any status"
            options={STATUS_OPTIONS}
            value={filters.status ?? ""}
            onChange={(event) =>
              setFilters({
                ...filters,
                status: (event.target.value || undefined) as AdminUserListItem["status"],
                page: 1
              })
            }
          />
        </div>

        <div className="mt-6">
          <AdminDataTable
            columns={columns}
            rows={data?.items}
            isLoading={isLoading}
            isError={isError}
            emptyLabel="No users match your search or filters."
            onRetry={() => refetch()}
            actions={(row) => <UserStatusActions user={row} />}
          />
        </div>

        {data && data.totalCount > filters.pageSize ? (
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              Page {filters.page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={filters.page >= totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Container>
  );
}
