import { Container } from "@/components/ui/container";

export function DashboardSkeleton() {
  return (
    <Container className="py-8">
      <div className="h-6 w-48 animate-pulse rounded bg-surface-muted" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-card bg-surface-muted" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-card bg-surface-muted" />
        <div className="h-72 animate-pulse rounded-card bg-surface-muted" />
      </div>
    </Container>
  );
}
