import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { AdminService } from './admin.service';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateAccountStatusDto } from './dto/update-user-status.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminUserListItem, PaginatedResult } from './types/admin.type';

/**
 * Admin APIs. Authorization is enforced here by the backend, never by ACC1 —
 * 08.5A §12, 02C §42 Zero Trust, RULE-096. The frontend's admin route
 * protection is UI-only and is not security.
 *
 * ADMIN is the canonical role from the existing Role enum (03 §33). No new
 * role or authorization mechanism was introduced; this uses the already
 * globally-registered RolesGuard.
 */
@Controller('admin')
@Roles(RoleType.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** API 67 — GET /api/v1/admin/users */
  @Get('users')
  async listUsers(
    @Query() dto: ListUsersDto,
  ): Promise<PaginatedResult<AdminUserListItem>> {
    return this.adminService.listUsers(dto);
  }

  /** API 68 — PATCH /api/v1/admin/users/{id}/status */
  @Patch('users/:id/status')
  async updateAccountStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountStatusDto,
  ): Promise<AdminUserListItem> {
    return this.adminService.updateAccountStatus(id, dto);
  }
}
