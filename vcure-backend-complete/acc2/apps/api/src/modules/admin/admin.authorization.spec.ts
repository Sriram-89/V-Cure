import { Reflector } from '@nestjs/core';
import {
  BadRequestException,
  ExecutionContext,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminController } from './admin.controller';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateAccountStatusDto } from './dto/update-user-status.dto';

const ctxFor = (controller: any, handlerName: string, user: unknown) =>
  ({
    getHandler: () => controller.prototype[handlerName],
    getClass: () => controller,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('Admin authorization (API 67)', () => {
  const guard = new RolesGuard(new Reflector());

  it('allows an ADMIN', () => {
    expect(
      guard.canActivate(ctxFor(AdminController, 'listUsers', { id: 'a', roles: ['ADMIN'] })),
    ).toBe(true);
  });

  it.each(['USER', 'DOCTOR', 'DIETITIAN', 'CORPORATE_ADMIN'])(
    'denies role %s',
    (role) => {
      expect(
        guard.canActivate(ctxFor(AdminController, 'listUsers', { id: 'u', roles: [role] })),
      ).toBe(false);
    },
  );

  it('denies an unauthenticated request', () => {
    expect(
      guard.canActivate(ctxFor(AdminController, 'listUsers', undefined)),
    ).toBe(false);
  });

  it('denies a PREMIUM subscription tier used as if it were a role (D-3)', () => {
    expect(
      guard.canActivate(
        ctxFor(AdminController, 'listUsers', { id: 'u', roles: ['PREMIUM'] }),
      ),
    ).toBe(false);
  });

  it('denies a non-admin on the API 68 status route', () => {
    expect(
      guard.canActivate(
        ctxFor(AdminController, 'updateAccountStatus', { id: 'u', roles: ['USER'] }),
      ),
    ).toBe(false);
  });

  it('allows an ADMIN on the API 68 status route', () => {
    expect(
      guard.canActivate(
        ctxFor(AdminController, 'updateAccountStatus', { id: 'a', roles: ['ADMIN'] }),
      ),
    ).toBe(true);
  });
});

describe('ListUsersDto validation (API 67)', () => {
  const build = (raw: Record<string, unknown>) =>
    validate(plainToInstance(ListUsersDto, raw));

  it('accepts a valid query', async () => {
    expect(await build({ query: 'asha', role: 'ADMIN', page: 2, pageSize: 50 })).toHaveLength(0);
  });

  it('rejects pageSize above the 100 upper bound', async () => {
    const errors = await build({ page: 1, pageSize: 1000 });
    expect(errors.some((e) => e.property === 'pageSize')).toBe(true);
  });

  it('rejects page below 1', async () => {
    const errors = await build({ page: 0, pageSize: 10 });
    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('rejects an unknown role value', async () => {
    // PREMIUM is a subscription tier, never a role (D-3).
    const errors = await build({ page: 1, pageSize: 10, role: 'PREMIUM' });
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('coerces numeric query strings, as they arrive from HTTP', async () => {
    const dto = plainToInstance(ListUsersDto, { page: '3', pageSize: '25' });
    expect(dto.page).toBe(3);
    expect(dto.pageSize).toBe(25);
    expect(await validate(dto)).toHaveLength(0);
  });
});

describe('UpdateAccountStatusDto validation (API 68)', () => {
  const build = (raw: Record<string, unknown>) =>
    validate(plainToInstance(UpdateAccountStatusDto, raw));

  it.each(['ACTIVE', 'SUSPENDED', 'BLOCKED'])('accepts %s', async (status) => {
    expect(await build({ status })).toHaveLength(0);
  });

  it('rejects an undocumented status value', async () => {
    // DELETED is a canonical lifecycle state, not an admin-settable one.
    const errors = await build({ status: 'DELETED' });
    expect(errors.some((e) => e.property === 'status')).toBe(true);
  });

  it('rejects a missing status', async () => {
    expect((await build({})).length).toBeGreaterThan(0);
  });

  // Mirrors the global pipe in main.ts (whitelist + forbidNonWhitelisted),
  // which is what actually prevents extra fields reaching the service.
  const pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });
  const meta = { type: 'body', metatype: UpdateAccountStatusDto } as any;

  it('rejects an attempt to smuggle extra fields such as role or email', async () => {
    await expect(
      pipe.transform(
        { status: 'BLOCKED', role: 'ADMIN', email: 'attacker@example.com' },
        meta,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('passes a clean status-only body through the global pipe', async () => {
    await expect(pipe.transform({ status: 'BLOCKED' }, meta)).resolves.toEqual({
      status: 'BLOCKED',
    });
  });
});

describe('UUID validation on API 68 path param', () => {
  const pipe = new ParseUUIDPipe();
  const meta = { type: 'param', data: 'id' } as any;

  it('accepts a valid UUID', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    await expect(pipe.transform(id, meta)).resolves.toBe(id);
  });

  it.each(['not-a-uuid', '123', ''])('rejects %p', async (bad) => {
    await expect(pipe.transform(bad, meta)).rejects.toThrow(BadRequestException);
  });
});

describe('Multi-role authorisation (F-2)', () => {
  const guard = new RolesGuard(new Reflector());

  it('admits a user holding ADMIN among several roles', () => {
    expect(
      guard.canActivate(
        ctxFor(AdminController, 'listUsers', {
          id: 'u',
          roles: ['USER', 'DOCTOR', 'ADMIN'],
        }),
      ),
    ).toBe(true);
  });

  it('denies a multi-role user without ADMIN', () => {
    expect(
      guard.canActivate(
        ctxFor(AdminController, 'listUsers', {
          id: 'u',
          roles: ['USER', 'DOCTOR', 'DIETITIAN'],
        }),
      ),
    ).toBe(false);
  });

  it('denies an empty role set', () => {
    expect(
      guard.canActivate(ctxFor(AdminController, 'listUsers', { id: 'u', roles: [] })),
    ).toBe(false);
  });

  it('denies a legacy single-role principal with no roles array', () => {
    expect(
      guard.canActivate(
        ctxFor(AdminController, 'listUsers', { id: 'u', role: 'ADMIN' } as any),
      ),
    ).toBe(false);
  });
});
