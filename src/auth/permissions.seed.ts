import { PrismaClient } from '../../generated/prisma';
import { PERMISSIONS, PERMISSION_DESCRIPTIONS, PERMISSION_MODULES } from './permissions.constants';

// Para uso interno del servicio de inicialización
let prismaInstance: PrismaClient | null = null;

function getPrismaInstance() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

export async function seedPermissions() {
  console.log('🌱 Seeding permissions...');
  const prisma = getPrismaInstance();

  const permissionsToSeed = Object.entries(PERMISSIONS).map(([key, value]) => ({
    key: value,
    name: PERMISSION_DESCRIPTIONS[value],
    description: PERMISSION_DESCRIPTIONS[value],
    module: getModuleFromPermissionKey(value),
  }));

  for (const permission of permissionsToSeed) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: {
        name: permission.name,
        description: permission.description,
        module: permission.module,
      },
      create: permission,
    });
  }

  console.log(`✅ Seeded ${permissionsToSeed.length} permissions`);
}

function getModuleFromPermissionKey(permissionKey: string): string {
  const [module] = permissionKey.split(':');
  return module;
}

// Función para asignar permisos básicos a empleados nuevos
export async function assignDefaultEmployeePermissions(userId: number) {
  const prisma = getPrismaInstance();
  
  const defaultEmployeePermissions = [
    PERMISSIONS.PRODUCTOS_VER,
    PERMISSIONS.PRODUCTOS_VER_PRECIO_VENTA,
    PERMISSIONS.PRODUCTOS_VER_STOCK,
    PERMISSIONS.VENTAS_CREAR,
    PERMISSIONS.VENTAS_VER_PROPIAS,
    PERMISSIONS.CAJA_REGISTRAR_ENTRADA,
    PERMISSIONS.CAJA_REGISTRAR_SALIDA,
    PERMISSIONS.CAJA_VER_MOVIMIENTOS,
    PERMISSIONS.CAJA_READ,
    PERMISSIONS.CATEGORIAS_VER,
    PERMISSIONS.PROVEEDORES_VER,
    PERMISSIONS.USUARIOS_VER_PROPIO,
    PERMISSIONS.SESIONES_VER_PROPIAS,
  ];

  for (const permissionKey of defaultEmployeePermissions) {
    const permission = await prisma.permission.findUnique({
      where: { key: permissionKey },
    });

    if (permission) {
      await prisma.userPermission.upsert({
        where: {
          usuarioId_permissionId: {
            usuarioId: userId,
            permissionId: permission.id,
          },
        },
        update: {
          granted: true,
        },
        create: {
          usuarioId: userId,
          permissionId: permission.id,
          granted: true,
        },
      });
    }
  }

  console.log(`✅ Assigned default permissions to user ${userId}`);
}

// Ejecutar seeding si es llamado directamente
if (require.main === module) {
  seedPermissions()
    .catch(console.error)
    .finally(() => {
      if (prismaInstance) {
        prismaInstance.$disconnect();
      }
    });
}