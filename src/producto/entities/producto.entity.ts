import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoriaEntity } from '../../categoria/entities/categoria.entity';
import { ProveedorEntity } from '../../proveedor/entities/proveedor.entity';

export class ProductoEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigoBarras: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ type: Number, format: 'float' })
  precioCosto: number;

  @ApiProperty({ type: Number, format: 'float' })
  precioVenta: number;

  @ApiPropertyOptional({ type: Number, format: 'float' })
  precioEspecial?: number;

  @ApiProperty()
  stock: number;

  @ApiProperty()
  categoriaId?: number;

  @ApiPropertyOptional({ type: CategoriaEntity })
  categoria?: CategoriaEntity;

  @ApiProperty()
  proveedorId?: number;

  @ApiPropertyOptional({ type: ProveedorEntity })
  proveedor?: ProveedorEntity;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
