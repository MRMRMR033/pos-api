import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email del usuario', example: 'juan@ejemplo.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contraseña', example: 'P@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
