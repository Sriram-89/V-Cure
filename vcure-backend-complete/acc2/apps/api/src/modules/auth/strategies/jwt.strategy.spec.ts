import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AuthRepository } from '../auth.repository';

/**
 * Per-request account-status enforcement (CONFLICT-3).
 *
 * This is the third and last place account status is interpreted, alongside
 * login and refresh. All three delegate to the same rule, so an account can
 * never be ACTIVE to one subsystem and SUSPENDED/BLOCKED to another.
 */
describe('JwtStrategy.validate — account status', () => {
  let repo: { findUserById: jest.Mock };
  let strategy: JwtStrategy;

  const user = {
    id: 'user_1',
    email: 'a@vcure.app',
    userRoles: [{ role: { name: 'USER' } }],
    status: 'ACTIVE',
    deletedAt: null,
  };

  const config = {
    get: () => ({ accessSecret: 's', accessExpiry: '15m' }),
  } as any;

  beforeEach(() => {
    repo = { findUserById: jest.fn().mockResolvedValue(user) };
    strategy = new JwtStrategy(config, repo as unknown as AuthRepository);
  });

  const payload = { sub: 'user_1', email: 'a@vcure.app', role: 'USER' };

  it('admits an ACTIVE account and returns the request principal', async () => {
    const result = await strategy.validate(payload as any);
    expect(result).toEqual({
      id: 'user_1',
      email: 'a@vcure.app',
      roles: ['USER'],
    });
  });

  it.each(['SUSPENDED', 'BLOCKED'])(
    'rejects every authenticated request for a %s account',
    async (status) => {
      repo.findUserById.mockResolvedValueOnce({ ...user, status });
      await expect(strategy.validate(payload as any)).rejects.toThrow(
        UnauthorizedException,
      );
    },
  );

  it('rejects a soft-deleted account', async () => {
    repo.findUserById.mockResolvedValueOnce({ ...user, deletedAt: new Date() });
    await expect(strategy.validate(payload as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects an unknown user', async () => {
    repo.findUserById.mockResolvedValueOnce(null);
    await expect(strategy.validate(payload as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('never leaks the Firebase UID into the request principal (RULE-013)', async () => {
    const result: any = await strategy.validate(payload as any);
    expect(result).not.toHaveProperty('firebaseUid');
    expect(result).not.toHaveProperty('passwordHash');
  });
});
