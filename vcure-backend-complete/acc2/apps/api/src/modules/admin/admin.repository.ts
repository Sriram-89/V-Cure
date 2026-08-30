import { Injectable } from '@nestjs/common';
import { Prisma, Role, User, AccountStatus } from '@prisma/client';
import { BaseRepository } from '../../database/base.repository';
import { PrismaTx } from '../../database/prisma-tx.type';

export interface AdminUserQuery {
  query?: string;
  role?: string;
  status?: AccountStatus;
  skip: number;
  take: number;
}

/** Persistence for admin user administration (API 67). */
export type AdminUserRow = User & {
  profile: { fullName: string } | null;
  userRoles: { role: { name: string } }[];
};

@Injectable()
export class AdminRepository extends BaseRepository {
  /**
   * Paginated user listing. Soft-deleted users are excluded (RULE-019/063).
   * Search covers email and profile full name only — the two identifying
   * fields ACC1's list displays. No other column is searched.
   */
  async findUsersPaginated(
    params: AdminUserQuery,
    tx?: PrismaTx,
  ): Promise<{
    items: AdminUserRow[];
    totalCount: number;
  }> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      // Canonical multi-role filter: match users holding the given role.
      ...(params.role
        ? { userRoles: { some: { role: { name: params.role } } } }
        : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.query
        ? {
            OR: [
              { email: { contains: params.query, mode: 'insensitive' } },
              {
                profile: {
                  fullName: { contains: params.query, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const db = this.db(tx);
    const [items, totalCount] = await Promise.all([
      db.user.findMany({
        where,
        include: {
        profile: { select: { fullName: true } },
        userRoles: { include: { role: { select: { name: true } } } },
      },
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      db.user.count({ where }),
    ]);

    return { items, totalCount };
  }

  findUserById(
    id: string,
    tx?: PrismaTx,
  ): Promise<(User & { profile: { fullName: string } | null }) | null> {
    return this.db(tx).user.findFirst({
      where: { id, deletedAt: null },
      include: {
        profile: { select: { fullName: true } },
        userRoles: { include: { role: { select: { name: true } } } },
      },
    }) as Promise<AdminUserRow>;
  }

  /**
   * API 68. Updates ONLY the status column — no other field can be written
   * through this path.
   */
  updateStatus(
    id: string,
    status: AccountStatus,
    tx?: PrismaTx,
  ): Promise<AdminUserRow> {
    return this.db(tx).user.update({
      where: { id },
      data: { status },
      include: {
        profile: { select: { fullName: true } },
        userRoles: { include: { role: { select: { name: true } } } },
      },
    }) as Promise<AdminUserRow>;
  }
}
