"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { RequireAuth } from "@/components/layout/require-auth";
import { useSwipeBack } from "@/hooks/use-swipe-back";

export function AppShell({ children }: { children: React.ReactNode }) {
  useSwipeBack();

  return (
    <RequireAuth>
      <div className="min-h-screen w-full bg-slate-900/90 flex flex-col items-center justify-center p-0 sm:py-6">
        <div className="relative w-full max-w-[430px] h-screen sm:h-[840px] bg-gray-50 sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/80 overflow-hidden flex flex-col">
          <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 w-full relative flex flex-col">{children}</main>
          <BottomNav />
        </div>
      </div>
    </RequireAuth>
  );
}

