import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { AdminKpiCards } from "@/components/admin/admin-kpi-cards";

export const metadata: Metadata = { title: "Admin Overview" };

export default function AdminOverviewPage() {
  return (
    <Container className="max-w-6xl py-8">
      <h1 className="text-2xl font-semibold text-text-primary">Overview</h1>
      <p className="mt-1 text-sm text-text-secondary">
        High-level platform status, per API 66 (GET /api/v1/admin/dashboard).
      </p>

      <div className="mt-6">
        <AdminKpiCards />
      </div>
    </Container>
  );
}
