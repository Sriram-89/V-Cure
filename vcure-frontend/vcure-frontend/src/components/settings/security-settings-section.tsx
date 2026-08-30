"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Smartphone, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { ROUTES } from "@/constants/routes";
import {
  useDeviceSessions,
  useLogoutSession,
  useLogoutAllOtherSessions
} from "@/hooks/use-settings";

export function SecuritySettingsSection() {
  const { data, isLoading, isError } = useDeviceSessions();
  const logoutSession = useLogoutSession();
  const logoutAllOther = useLogoutAllOtherSessions();
  const [isConfirmingLogoutAll, setIsConfirmingLogoutAll] = useState(false);

  const otherSessionsCount = data?.filter((s) => !s.isCurrentDevice).length ?? 0;

  return (
    <div className="rounded-card border border-border bg-surface p-6 shadow-card">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <Shield className="h-4 w-4" aria-hidden="true" />
        Security
      </h2>

      <div className="mt-4 flex items-center justify-between rounded-md bg-surface-muted p-3">
        <p className="text-sm text-text-primary">Forgot your password or want to change it?</p>
        <Link href={ROUTES.FORGOT_PASSWORD}>
          <Button type="button" variant="outline" size="sm">
            Reset password
          </Button>
        </Link>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
            Active sessions
          </p>
          {otherSessionsCount > 0 ? (
            <button
              type="button"
              onClick={() => setIsConfirmingLogoutAll(true)}
              className="text-xs font-medium text-danger hover:underline"
            >
              Log out all other devices
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="mt-3 space-y-2">
            <div className="h-14 animate-pulse rounded-md bg-surface-muted" />
            <div className="h-14 animate-pulse rounded-md bg-surface-muted" />
          </div>
        ) : isError || !data ? (
          <p className="mt-3 text-sm text-danger">Couldn&apos;t load your sessions.</p>
        ) : data.length === 0 ? (
          <p className="mt-3 text-sm text-text-secondary">No active sessions found.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {data.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between gap-3 rounded-md bg-surface-muted p-3"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-text-secondary" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-text-primary">
                      {session.deviceName}
                      {session.isCurrentDevice ? (
                        <span className="ml-2 text-xs text-primary">This device</span>
                      ) : null}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {session.location} · Active{" "}
                      {new Date(session.lastActiveAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {!session.isCurrentDevice ? (
                  <button
                    type="button"
                    aria-label={`Log out ${session.deviceName}`}
                    onClick={() => logoutSession.mutate(session.id)}
                    className="rounded-md p-1.5 text-text-secondary hover:bg-red-50 hover:text-danger"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmingLogoutAll}
        title="Log out all other devices?"
        description="You'll stay signed in here, but every other device will need to log in again."
        confirmLabel="Log out other devices"
        isConfirming={logoutAllOther.isPending}
        onConfirm={() => {
          logoutAllOther.mutate();
          setIsConfirmingLogoutAll(false);
        }}
        onCancel={() => setIsConfirmingLogoutAll(false)}
      />
    </div>
  );
}
