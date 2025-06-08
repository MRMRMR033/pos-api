import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Rol } from '../../../generated/prisma';

export class CreateUsuarioDto {
  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
  @IsString() @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({ description: 'Email del usuario', example: 'juan@ejemplo.com' })
  @IsEmail() @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Contraseña (mínimo 6 caracteres)', example: 'P@ssw0rd!' })
  @IsString() @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Rol del usuario', enum: Rol, example: Rol.empleado })
  @IsEnum(Rol)
  rol: Rol;
}