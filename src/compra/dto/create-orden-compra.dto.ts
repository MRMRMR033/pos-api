import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDetalleOrdenCompraDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsNumber()
  productoId: number;

  @ApiProperty({ description: 'Cantidad a ordenar' })
  @IsNumber()
  cantidad: number;

  @ApiProperty({ description: 'Precio unitario del producto' })
  @IsNumber({ maxDecimalPlaces: 2 })
  precioUnitario: number;
}

export class CreateOrdenCompraDto {
  @ApiProperty({ description: 'Número de orden único' })
  @IsString()
  numeroOrden: string;

  @ApiProperty({ description: 'ID del proveedor' })
  @IsNumber()
  proveedorId: number;

  @ApiPropertyOptional({ description: 'Fecha de entrega esperada' })
  @IsOptional()
  @IsDateString()
  fechaEntrega?: string;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({ 
    description: 'Detalles de los productos en la orden',
    type: [CreateDetalleOrdenCompraDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetalleOrdenCompraDto)
  detalles: CreateDetalleOrdenCompraDto[];
}