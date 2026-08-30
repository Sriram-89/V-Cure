import { IsIn } from 'class-validator';
import { AccountStatus } from '@prisma/client';

/**
 * API 68 — PATCH /admin/users/{id}/status.
 *
 * The Bible documents exactly three admin actions (Suspend / Activate / Block)
 * and ACC1's AdminUserStatus matches them. ACC3's canonical AccountStatus also
 * carries PENDING_VERIFICATION, DEACTIVATED and DELETED, which are lifecycle
 * states this endpoint does NOT grant admins the power to set — so the DTO is
 * constrained to the documented three rather than the whole enum.
 */
export const ADMIN_SETTABLE_STATUSES: AccountStatus[] = [
  'ACTIVE',
  'SUSPENDED',
  'BLOCKED',
];

export class UpdateAccountStatusDto {
  @IsIn(ADMIN_SETTABLE_STATUSES)
  status!: AccountStatus;
}
