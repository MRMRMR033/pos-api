import { ApiProperty } from '@nestjs/swagger';

export class ProveedorEntity {
  @ApiProperty({ description: 'Identificador único del proveedor', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nombre del proveedor', example: 'PepsiCo' })
  nombre: string;

  @ApiProperty({description: 'Descripción del proveedor', example: 'Proveedor de bebidas y alimentos' })
  contacto?: string
}
