import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    description: 'Email del usuario registrado en el sistema',
    example: 'admin@pos-system.com',
    format: 'email',
    required: true
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @ApiProperty({ 
    description: 'Contraseña del usuario',
    example: '12345',
    format: 'password',
    required: true,
    minLength: 1
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
