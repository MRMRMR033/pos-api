import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RevokePermissionDto {
  @ApiProperty({ description: 'ID del usuario' })
  @IsInt()
  userId: number;

  @ApiProperty({ description: 'Clave del permiso a revocar' })
  @IsString()
  permissionKey: string;
}