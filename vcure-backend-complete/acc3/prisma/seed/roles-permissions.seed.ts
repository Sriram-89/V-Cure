import { PrismaClient, RoleType } from '@prisma/client';

/**
 * Sec. 27 DATABASE SEEDING — Roles, Permissions
 * Sec. 65 SEED STRATEGY — idempotent, repeatable
 */
export async function seedRolesAndPermissions(prisma: PrismaClient) {
  const roles = Object.values(RoleType) as RoleType[];
  const roleRecords: Record<string, string> = {};

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roleRecords[roleName] = role.id;
  }

  const permissionDefinitions: { code: string; description: string }[] = [
    { code: 'health_profile:read', description: 'Read own health profile' },
    { code: 'health_profile:write', description: 'Write own health profile' },
    { code: 'medical_report:read', description: 'Read own medical reports' },
    { code: 'medical_report:write', description: 'Upload/edit own medical reports' },
    { code: 'recommendation:read', description: 'Read own recommendations' },
    { code: 'recommendation:review', description: 'Doctor/Dietitian review of recommendations' },
    { code: 'meal_plan:approve', description: 'Dietitian approval of meal plans' },
    { code: 'admin:manage_users', description: 'Admin — manage user accounts' },
    { code: 'admin:manage_content', description: 'Admin — manage education/knowledge content' },
    { code: 'admin:view_analytics', description: 'Admin — view platform analytics' },
    { code: 'admin:manage_system_settings', description: 'Super Admin — manage system settings/feature flags' },
    { code: 'support:manage_tickets', description: 'Support — manage support tickets' },
  ];

  const permissionRecords: Record<string, string> = {};
  for (const def of permissionDefinitions) {
    const permission = await prisma.permission.upsert({
      where: { code: def.code },
      update: { description: def.description },
      create: def,
    });
    permissionRecords[def.code] = permission.id;
  }

  const rolePermissionMap: Record<RoleType, string[]> = {
    USER: ['health_profile:read', 'health_profile:write', 'medical_report:read', 'medical_report:write', 'recommendation:read'],
    DOCTOR: ['medical_report:read', 'recommendation:read', 'recommendation:review'],
    DIETITIAN: ['recommendation:read', 'recommendation:review', 'meal_plan:approve'],
    SUPPORT: ['support:manage_tickets'],
    ADMIN: ['admin:manage_users', 'admin:manage_content', 'admin:view_analytics'],
    SUPER_ADMIN: [
      'admin:manage_users',
      'admin:manage_content',
      'admin:view_analytics',
      'admin:manage_system_settings',
    ],
  };

  for (const [roleName, permissionCodes] of Object.entries(rolePermissionMap)) {
    const roleId = roleRecords[roleName];
    for (const code of permissionCodes) {
      const permissionId = permissionRecords[code];
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }

  console.log(`Seeded ${roles.length} roles and ${permissionDefinitions.length} permissions.`);
}
