import { Test } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ListUsersDto } from './dto/list-users.dto';

describe('AdminService — API 67 GET /admin/users', () => {
  let service: AdminService;
  let prisma: any;

  const row = {
    id: 'u1',
    email: 'asha@vcure.app',
    userRoles: [{ role: { name: 'USER' } }],
    status: 'ACTIVE',
    createdAt: new Date('2026-01-05T00:00:00.000Z'),
    profile: { fullName: 'Asha R' },
  };

  const dto = (over: Partial<ListUsersDto> = {}): ListUsersDto =>
    ({ page: 1, pageSize: 20, ...over }) as ListUsersDto;

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn().mockResolvedValue([row]),
        count: jest.fn().mockResolvedValue(1),
        findFirst: jest.fn().mockResolvedValue(row),
        update: jest.fn().mockImplementation(({ data }: any) =>
          Promise.resolve({ ...row, status: data.status }),
        ),
      },
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminRepository,
          useValue: new AdminRepository(prisma as unknown as PrismaService),
        },
      ],
    }).compile();
    service = moduleRef.get(AdminService);
  });

  it('returns the ACC1 PaginatedResult envelope', async () => {
    const result = await service.listUsers(dto());
    expect(result).toEqual({
      items: [
        {
          id: 'u1',
          fullName: 'Asha R',
          email: 'asha@vcure.app',
          roles: ['USER'],
          role: 'USER',
          status: 'ACTIVE',
          createdAt: row.createdAt,
        },
      ],
      totalCount: 1,
      page: 1,
      pageSize: 20,
    });
  });

  it('excludes soft-deleted users', async () => {
    await service.listUsers(dto());
    expect(prisma.user.findMany.mock.calls[0][0].where.deletedAt).toBeNull();
  });

  it('translates page/pageSize into skip/take', async () => {
    await service.listUsers(dto({ page: 3, pageSize: 10 }));
    const arg = prisma.user.findMany.mock.calls[0][0];
    expect(arg.skip).toBe(20);
    expect(arg.take).toBe(10);
  });

  it('searches email and profile name, case-insensitively', async () => {
    await service.listUsers(dto({ query: 'asha' }));
    const where = prisma.user.findMany.mock.calls[0][0].where;
    expect(where.OR).toEqual([
      { email: { contains: 'asha', mode: 'insensitive' } },
      { profile: { fullName: { contains: 'asha', mode: 'insensitive' } } },
    ]);
  });

  it('applies the role filter only when supplied', async () => {
    await service.listUsers(dto());
    expect(prisma.user.findMany.mock.calls[0][0].where.userRoles).toBeUndefined();
    await service.listUsers(dto({ role: 'ADMIN' as any }));
    expect(prisma.user.findMany.mock.calls[1][0].where.userRoles).toEqual({ some: { role: { name: 'ADMIN' } } });
  });

  it('counts with the same predicate used for the page', async () => {
    await service.listUsers(dto({ query: 'asha' }));
    expect(prisma.user.count.mock.calls[0][0].where).toEqual(
      prisma.user.findMany.mock.calls[0][0].where,
    );
  });

  it('returns an empty fullName rather than fabricating one pre-onboarding', async () => {
    prisma.user.findMany.mockResolvedValueOnce([{ ...row, profile: null }]);
    const result = await service.listUsers(dto());
    expect(result.items[0].fullName).toBe('');
  });

  describe('API 67 status filter', () => {
    it.each(['ACTIVE', 'SUSPENDED', 'BLOCKED'])(
      'filters by %s',
      async (status) => {
        await service.listUsers(dto({ status: status as any }));
        const where = prisma.user.findMany.mock.calls.at(-1)[0].where;
        expect(where.status).toBe(status);
      },
    );

    it('omits the status predicate when no status is supplied', async () => {
      await service.listUsers(dto());
      expect(prisma.user.findMany.mock.calls[0][0].where.status).toBeUndefined();
    });

    it('combines the status filter with pagination', async () => {
      await service.listUsers(dto({ status: 'BLOCKED' as any, page: 2, pageSize: 5 }));
      const arg = prisma.user.findMany.mock.calls[0][0];
      expect(arg.where.status).toBe('BLOCKED');
      expect(arg.skip).toBe(5);
      expect(arg.take).toBe(5);
    });

    it('returns status in every list item', async () => {
      const result = await service.listUsers(dto());
      expect(result.items[0].status).toBe('ACTIVE');
    });
  });

  describe('API 68 updateAccountStatus', () => {
    it.each([
      ['ACTIVE', 'SUSPENDED'],
      ['ACTIVE', 'BLOCKED'],
      ['SUSPENDED', 'ACTIVE'],
      ['BLOCKED', 'ACTIVE'],
    ])('transitions %s -> %s', async (from, to) => {
      prisma.user.findFirst.mockResolvedValueOnce({ ...row, status: from });
      const result = await service.updateAccountStatus('u1', { status: to as any });
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: { status: to } }),
      );
      expect(result.status).toBe(to);
    });

    it('writes only the status column — no other field is mutable here', async () => {
      await service.updateAccountStatus('u1', { status: 'BLOCKED' as any });
      expect(Object.keys(prisma.user.update.mock.calls[0][0].data)).toEqual(['status']);
    });

    it('returns the full ACC1 AdminUserListItem shape', async () => {
      const result = await service.updateAccountStatus('u1', { status: 'SUSPENDED' as any });
      expect(Object.keys(result).sort()).toEqual(
        // Canonical: roles[] is authoritative; role is the single-role
        // convenience value; no subscriptionTier is derived (F-3).
        ['createdAt', 'email', 'fullName', 'id', 'role', 'roles', 'status'],
      );
    });

    it('404s when the target user does not exist', async () => {
      prisma.user.findFirst.mockResolvedValueOnce(null);
      await expect(
        service.updateAccountStatus('missing', { status: 'ACTIVE' as any }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('treats a soft-deleted target as absent', async () => {
      await service.updateAccountStatus('u1', { status: 'ACTIVE' as any });
      expect(prisma.user.findFirst.mock.calls[0][0].where.deletedAt).toBeNull();
    });
  });
});
