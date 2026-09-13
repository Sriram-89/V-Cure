"use client";

import { useState } from "react";
import { Container } from "@/components/ui/container";
import { InputField } from "@/components/ui/input-field";
import { AdminDataTable, type AdminTableColumn } from "@/components/admin/admin-data-table";
import { useAuditLogs } from "@/hooks/use-admin";
import type { AuditLogEntry, AuditLogFilters } from "@/types/admin";

const columns: AdminTableColumn<AuditLogEntry>[] = [
  { key: "timestamp", label: "Time", render: (row) => new Date(row.timestamp).toLocaleString() },
  { key: "userName", label: "User", render: (row) => row.userName },
  { key: "action", label: "Action", render: (row) => row.action },
  { key: "oldValue", label: "Old value", render: (row) => row.oldValue ?? "—" },
  { key: "newValue", label: "New value", render: (row) => row.newValue ?? "—" }
];

export default function AdminAuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const { data, isLoading, isError, refetch } = useAuditLogs(filters);

  return (
    <Container className="max-w-5xl py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Audit logs</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Date, user, and action filters per API 74 (GET /api/v1/admin/audit-logs).
      </p>

      <div className="mt-6 rounded-card border border-border bg-surface p-6 shadow-card">
        <div className="grid gap-3 sm:grid-cols-3">
          <InputField
            label="From"
            type="date"
            value={filters.dateFrom ?? ""}
            onChange={(event) => setFilters({ ...filters, dateFrom: event.target.value || undefined })}
          />
          <InputField
            label="To"
            type="date"
            value={filters.dateTo ?? ""}
            onChange={(event) => setFilters({ ...filters, dateTo: event.target.value || undefined })}
          />
          <InputField
            label="Action contains"
            placeholder="e.g. USER_STATUS_UPDATED"
            value={filters.action ?? ""}
            onChange={(event) => setFilters({ ...filters, action: event.target.value || undefined })}
          />
        </div>

        <div className="mt-6">
          <AdminDataTable
            columns={columns}
            rows={data}
            isLoading={isLoading}
            isError={isError}
            emptyLabel="No audit log entries match these filters."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    </Container>
  );
}
