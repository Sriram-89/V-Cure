import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * CONFLICT-3: `User.status` is the single canonical account-status field.
 * These tests pin the authentication behaviour for each state so no subsystem
 * can drift from it.
 */
describe('Account status → authentication behaviour', () => {
  const buildStrategy = (user: unknown) => {
    const prisma: any = { user: { findUnique: jest.fn().mockResolvedValue(user) } };
    const repo = new AuthRepository(prisma as unknown as PrismaService);
    return new JwtStrategy({ get: () => ({ accessSecret: 's' }) } as any, repo);
  };

  const payload = { sub: 'u1', email: 'a@b.c', role: 'USER' } as any;
  const base = {
    id: 'u1',
    email: 'a@b.c',
    userRoles: [{ role: { name: 'USER' } }],
    deletedAt: null,
  };

  it('ACTIVE — authenticated access permitted', async () => {
    const strategy = buildStrategy({ ...base, status: 'ACTIVE' });
    // Canonical principal carries the full role set (F-2).
    await expect(strategy.validate(payload)).resolves.toEqual({
      id: 'u1',
      email: 'a@b.c',
      roles: ['USER'],
    });
  });

  it('SUSPENDED — access denied', async () => {
    const strategy = buildStrategy({ ...base, status: 'SUSPENDED' });
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('BLOCKED — access denied', async () => {
    const strategy = buildStrategy({ ...base, status: 'BLOCKED' });
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('soft-deleted — access denied even when status is ACTIVE', async () => {
    const strategy = buildStrategy({ ...base, status: 'ACTIVE', deletedAt: new Date() });
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('unknown user — access denied', async () => {
    const strategy = buildStrategy(null);
    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
