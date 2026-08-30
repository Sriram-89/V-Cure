import { Injectable, NotFoundException } from '@nestjs/common';
import { User, AccountStatus } from '@prisma/client';
import { AdminRepository, AdminUserRow } from './admin.repository';
import { UpdateAccountStatusDto } from './dto/update-user-status.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { AdminUserListItem, PaginatedResult } from './types/admin.type';

@Injectable()
export class AdminService {
  constructor(private readonly repository: AdminRepository) {}

  /** API 67 — GET /api/v1/admin/users */
  async listUsers(
    dto: ListUsersDto,
  ): Promise<PaginatedResult<AdminUserListItem>> {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? 20;

    const { items, totalCount } = await this.repository.findUsersPaginated({
      query: dto.query,
      role: dto.role,
      status: dto.status,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map((user) => this.toListItem(user)),
      totalCount,
      page,
      pageSize,
    };
  }

  /**
   * API 68 — PATCH /api/v1/admin/users/{id}/status
   *
   * Only the status column is written. Soft-deleted users are treated as
   * absent (404), consistent with every other owned-resource lookup.
   *
   * AUDIT: the Bible requires an audit record for this action. AuditLog
   * persistence remains BLOCKED (BR-07 action vocabulary undefined; DB-10
   * value serialisation unresolved). No audit record is written and none is
   * faked.
   */
  async updateAccountStatus(
    id: string,
    dto: UpdateAccountStatusDto,
  ): Promise<AdminUserListItem> {
    const existing = await this.repository.findUserById(id);
    if (!existing) {
      throw new NotFoundException('User not found');
    }
    const updated = await this.repository.updateStatus(id, dto.status);
    return this.toListItem(updated);
  }

  private toListItem(
    user: AdminUserRow,
  ): AdminUserListItem {
    const roles = (user.userRoles ?? []).map(
      (ur: { role: { name: string } }) => ur.role.name,
    );
    return {
      id: user.id,
      // fullName lives on UserProfile, which does not exist until the user
      // completes onboarding. Empty string rather than a fabricated name.
      fullName: user.profile?.fullName ?? '',
      email: user.email,
      roles,
      // F-2: deterministic only for a single-role user.
      role: roles.length === 1 ? roles[0] : null,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
