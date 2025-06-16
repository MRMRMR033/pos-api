import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ 
    description: 'JWT token de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AcG9zLXN5c3RlbS5jb20iLCJmdWxsTmFtZSI6IkFkbWluaXN0cmFkb3IgZGVsIFNpc3RlbWEiLCJpYXQiOjE3NTAwNzM1NTUsImV4cCI6MTc1MDA3NzE1NX0.wDbzMfzfnRAFGcbYHOCKSAs_JUltwLEDsw0MyhfRDSU'
  })
  access_token: string;
}

export class UserProfileResponseDto {
  @ApiProperty({ description: 'ID único del usuario', example: 1 })
  id: number;

  @ApiProperty({ description: 'Email del usuario', example: 'admin@pos-system.com' })
  email: string;

  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Administrador del Sistema' })
  fullName: string;

  @ApiProperty({ description: 'Rol del usuario', enum: ['admin', 'empleado'], example: 'admin' })
  rol: string;

  @ApiProperty({ description: 'Fecha de creación', example: '2025-06-16T04:35:02.872Z' })
  createdAt: string;

  @ApiProperty({ description: 'Fecha de última actualización', example: '2025-06-16T04:35:02.872Z' })
  updatedAt: string;
}

export class PermissionDto {
  @ApiProperty({ description: 'ID único del permiso', example: 1 })
  id: number;

  @ApiProperty({ description: 'Clave única del permiso', example: 'productos:ver_precio_costo' })
  key: string;

  @ApiProperty({ description: 'Nombre descriptivo del permiso', example: 'Ver precio de costo de productos' })
  name: string;

  @ApiProperty({ description: 'Descripción detallada del permiso', example: 'Permite ver el precio de costo de los productos', required: false })
  description?: string;

  @ApiProperty({ description: 'Módulo al que pertenece', example: 'productos' })
  module: string;
}

export class UserPermissionsResponseDto {
  @ApiProperty({ description: 'Lista de permisos del usuario', type: [PermissionDto] })
  permissions: PermissionDto[];

  @ApiProperty({ description: 'Total de permisos asignados', example: 15 })
  total: number;

  @ApiProperty({ description: 'Rol del usuario', enum: ['admin', 'empleado'], example: 'empleado' })
  userRole: string;
}

export class AllPermissionsResponseDto {
  @ApiProperty({ description: 'Lista de todos los permisos disponibles', type: [PermissionDto] })
  permissions: PermissionDto[];

  @ApiProperty({ description: 'Total de permisos en el sistema', example: 42 })
  total: number;

  @ApiProperty({ description: 'Permisos agrupados por módulo' })
  byModule: Record<string, PermissionDto[]>;
}

export class PermissionActionResponseDto {
  @ApiProperty({ description: 'Indica si la acción fue exitosa', example: true })
  success: boolean;

  @ApiProperty({ description: 'Mensaje de confirmación', example: 'Permiso otorgado exitosamente' })
  message: string;

  @ApiProperty({ description: 'ID del usuario afectado', example: 5 })
  userId: number;

  @ApiProperty({ description: 'Clave del permiso modificado', example: 'productos:ver_precio_costo' })
  permissionKey: string;

  @ApiProperty({ description: 'Estado del permiso después de la acción', example: true })
  granted: boolean;
}