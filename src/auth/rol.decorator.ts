import { SetMetadata } from '@nestjs/common';
import { Rol as Roles } from '../../generated/prisma';

export const ROLES_KEY = 'roles';
export const Rol = (...roles: Roles[]) => SetMetadata(ROLES_KEY, roles);
