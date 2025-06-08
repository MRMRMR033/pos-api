import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ description: 'Código de barras único', example: '1234567890123' })
  @IsString() @IsNotEmpty()
  codigoBarras: string;

  @ApiProperty({ description: 'Nombre del producto', example: 'Coca-Cola 600ml' })
  @IsString() @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Precio de costo (hasta 2 decimales)', example: 10.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Máximo 2 decimales' })
  @Min(0)
  precioCosto: number;

  @ApiProperty({ description: 'Precio de venta (hasta 2 decimales)', example: 15.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Máximo 2 decimales' })
  @Min(0)
  precioVenta: number;

  @ApiPropertyOptional({ description: 'Precio especial opcional', example: 12.5 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Máximo 2 decimales' })
  @Min(0)
  precioEspecial?: number;

  @ApiProperty({ description: 'Stock en inventario', example: 100 })
  @Type(() => Number)
  @IsNumber({}, { message: 'Debe ser un número entero' })
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: 'ID de la categoría', example: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'Debe ser un número entero' })
  categoriaId?: number;

  @ApiPropertyOptional({ description: 'ID del proveedor', example: 2 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'Debe ser un número entero' })
  proveedorId?: number;
}
