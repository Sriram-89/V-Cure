import { AccountStatus } from '@prisma/client';

/**
 * Mirrors ACC1 `AdminUserListItem`, including `status` now that CONFLICT-3
 * is resolved.
 *
 * `role` and `subscriptionTier` are returned separately per locked decision
 * D-3: PREMIUM is a subscription tier, never an authorization role. ACC1's
 * current `role` union still includes "PREMIUM" — see ACC1-CONTRADICTION-1.
 */
export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  role: string | null;

  status: AccountStatus;
  createdAt: Date;
}

/** Mirrors ACC1 `PaginatedResult<T>`. */
export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
