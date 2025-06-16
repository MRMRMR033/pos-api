import { IsInt, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GrantPermissionDto {
  @ApiProperty({ description: 'ID del usuario' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Clave del permiso (ej: productos:ver_precio_costo)' })
  @IsString()
  permissionKey: string;

  @ApiProperty({ description: 'Si se otorga (true) o revoca (false) el permiso', default: true })
  @IsOptional()
  @IsBoolean()
  granted?: boolean;
}