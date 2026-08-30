import { SetMetadata } from '@nestjs/common';
import { RoleType } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Canonical multi-role authorisation metadata. */
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
