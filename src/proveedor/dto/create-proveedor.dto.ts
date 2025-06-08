import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProveedorDto {
  @ApiProperty({ description: 'Nombre del proveedor', example: 'PepsiCo' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    description: 'Información de contacto del proveedor (email, teléfono, etc.)',
    example: 'contacto@pepsico.com',
  })
  @IsString()
  @IsOptional()
  contacto?: string;
}
