// src/auth/dto/register.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../../../generated/prisma';

export class RegisterDto {
  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: 'Email del usuario', example: 'juan@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña (mínimo 6 caracteres)', example: 'P@ssw0rd!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Rol del usuario', enum: Rol, example: Rol.empleado })
  @IsEnum(Rol)
  role: Rol;
}
