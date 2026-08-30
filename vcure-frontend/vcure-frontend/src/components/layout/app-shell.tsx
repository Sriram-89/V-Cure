import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { RequireAuth } from "@/components/layout/require-auth";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col pb-20">
          <TopBar />
          <main className="flex-1 bg-surface-muted">{children}</main>
        </div>
        <BottomNav />
      </div>
    </RequireAuth>
  );
}
