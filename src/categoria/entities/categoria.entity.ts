import { ApiProperty } from '@nestjs/swagger';

export class CategoriaEntity {
  @ApiProperty({ description: 'ID de la categoría' })
  id: number;

  @ApiProperty({ description: 'Nombre de la categoría' })
  nombre: string;
}