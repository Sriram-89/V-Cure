import Link from "next/link";
import { User, Crown, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export function ProfileLinkCard() {
  return (
    <Link
      href={ROUTES.PROFILE}
      className="flex items-center justify-between rounded-card border border-border bg-surface p-6 shadow-card hover:border-primary"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary">
          <User className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text-primary">Profile</p>
          <p className="text-xs text-text-secondary">
            Personal info, health profile, and medical history
          </p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-text-secondary" aria-hidden="true" />
    </Link>
  );
}

export function SubscriptionLinkCard() {
  return (
    <Link
      href={ROUTES.PREMIUM}
      className="flex items-center justify-between rounded-card border border-border bg-surface p-6 shadow-card hover:border-primary"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary-50 text-secondary">
          <Crown className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-text-primary">Subscription</p>
          <p className="text-xs text-text-secondary">Manage your plan and billing</p>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-text-secondary" aria-hidden="true" />
    </Link>
  );
}
