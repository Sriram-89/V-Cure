import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Schema-level guarantees for CONFLICT-3.
 *
 * These assert the migration-safety properties that cannot be proven by unit
 * tests while `prisma migrate` is unavailable: that existing rows get a usable
 * status, and that `isActive` was fully retired rather than left as a second,
 * contradictory source of truth.
 */
describe('User status schema contract', () => {
  const schema = readFileSync(
    join(__dirname, '../../../prisma/schema.prisma'),
    'utf8',
  );
  const userModel = /model User \{[\s\S]*?\n\}/.exec(schema)?.[0] ?? '';

  it('preserves ACC3 statuses and adds only BLOCKED for ACC1 (F-1)', () => {
    const block = /enum AccountStatus \{([\s\S]*?)\n\}/.exec(schema)?.[1] ?? '';
    const values = block
      .split('\n')
      .map((l) => l.split('//')[0].trim())
      .filter((l) => /^[A-Z_]+$/.test(l));
    expect(values).toEqual([
      'PENDING_VERIFICATION',
      'ACTIVE',
      'SUSPENDED',
      'DEACTIVATED',
      'DELETED',
      'BLOCKED',
    ]);
  });

  it('keeps ACC3 canonical default of PENDING_VERIFICATION', () => {
    expect(userModel).toMatch(
      /status\s+AccountStatus\s+@default\(PENDING_VERIFICATION\)/,
    );
  });

  it('has fully retired isActive — no second source of account state', () => {
    expect(userModel).not.toMatch(/\bisActive\b/);
  });

  it('canonicalises roles as a relation, never a scalar (F-2)', () => {
    expect(userModel).toMatch(/userRoles\s+UserRole\[\]/);
    expect(userModel).not.toMatch(/\brole\s+RoleType\b/);
    // Subscriptions are a relation too — no scalar tier column (F-3).
    expect(userModel).toMatch(/subscriptions\s+Subscription\[\]/);
    expect(userModel).not.toMatch(/subscriptionTier/);
  });

  it('retains soft delete on User', () => {
    expect(userModel).toMatch(/deletedAt\s+DateTime\?/);
  });
});
