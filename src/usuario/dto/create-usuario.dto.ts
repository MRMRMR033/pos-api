import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Rol } from '../../../generated/prisma';

export class CreateUsuarioDto {
  @ApiProperty({ description: 'Nombre del usuario', example: 'Juan Perez' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Email (opcional)', example: 'juan@ejemplo.com' })
  @IsEmail() @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Contraseña (en texto, se encriptará)', example: 'P@ssw0rd!' })
  @IsString() @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Rol del usuario', enum: Rol, example: Rol.empleado })
  @IsEnum(Rol)
  rol: Rol;
}
