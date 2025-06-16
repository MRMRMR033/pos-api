import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS } from './permissions.constants';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Helper decorators para uso común
export const RequireProductPermissions = (...permissions: string[]) =>
  RequirePermission(...permissions);

export const RequireSalesPermissions = (...permissions: string[]) =>
  RequirePermission(...permissions);

export const RequireCashPermissions = (...permissions: string[]) =>
  RequirePermission(...permissions);

export const RequireAdminPermissions = (...permissions: string[]) =>
  RequirePermission(...permissions);