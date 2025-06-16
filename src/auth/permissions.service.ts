import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async hasPermission(userId: number, permissionKey: string): Promise<boolean> {
    // Los admins tienen todos los permisos
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { rol: true },
    });

    if (user?.rol === 'admin') {
      return true;
    }

    // Verificar si el usuario tiene el permiso específico
    const userPermission = await this.prisma.userPermission.findFirst({
      where: {
        usuarioId: userId,
        granted: true,
        permission: {
          key: permissionKey,
        },
      },
    });

    return !!userPermission;
  }

  async hasAnyPermission(userId: number, permissionKeys: string[]): Promise<boolean> {
    // Los admins tienen todos los permisos
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { rol: true },
    });

    if (user?.rol === 'admin') {
      return true;
    }

    // Verificar si el usuario tiene al menos uno de los permisos
    const userPermission = await this.prisma.userPermission.findFirst({
      where: {
        usuarioId: userId,
        granted: true,
        permission: {
          key: {
            in: permissionKeys,
          },
        },
      },
    });

    return !!userPermission;
  }

  async hasAllPermissions(userId: number, permissionKeys: string[]): Promise<boolean> {
    // Los admins tienen todos los permisos
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { rol: true },
    });

    if (user?.rol === 'admin') {
      return true;
    }

    // Verificar si el usuario tiene todos los permisos
    const userPermissions = await this.prisma.userPermission.count({
      where: {
        usuarioId: userId,
        granted: true,
        permission: {
          key: {
            in: permissionKeys,
          },
        },
      },
    });

    return userPermissions === permissionKeys.length;
  }

  async getUserPermissions(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { rol: true },
    });

    if (user?.rol === 'admin') {
      // Los admins tienen todos los permisos
      return await this.prisma.permission.findMany({
        select: {
          id: true,
          key: true,
          name: true,
          description: true,
          module: true,
        },
      });
    }

    return await this.prisma.permission.findMany({
      where: {
        userPermissions: {
          some: {
            usuarioId: userId,
            granted: true,
          },
        },
      },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        module: true,
      },
    });
  }

  async grantPermission(userId: number, permissionKey: string, grantedById?: number) {
    const permission = await this.prisma.permission.findUnique({
      where: { key: permissionKey },
    });

    if (!permission) {
      throw new Error(`Permission ${permissionKey} not found`);
    }

    return await this.prisma.userPermission.upsert({
      where: {
        usuarioId_permissionId: {
          usuarioId: userId,
          permissionId: permission.id,
        },
      },
      update: {
        granted: true,
        grantedAt: new Date(),
        grantedById,
      },
      create: {
        usuarioId: userId,
        permissionId: permission.id,
        granted: true,
        grantedById,
      },
    });
  }

  async revokePermission(userId: number, permissionKey: string) {
    const permission = await this.prisma.permission.findUnique({
      where: { key: permissionKey },
    });

    if (!permission) {
      throw new Error(`Permission ${permissionKey} not found`);
    }

    return await this.prisma.userPermission.upsert({
      where: {
        usuarioId_permissionId: {
          usuarioId: userId,
          permissionId: permission.id,
        },
      },
      update: {
        granted: false,
      },
      create: {
        usuarioId: userId,
        permissionId: permission.id,
        granted: false,
      },
    });
  }
}