import { Type } from 'class-transformer';
import { IsInt, Min, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTicketItemDto {
  @ApiPropertyOptional({ description: 'ID del ticket (se asigna automáticamente)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ticketId?: number;

  @ApiProperty({ description: 'ID del producto', example: 10 })
  @Type(() => Number)
  @IsInt()
  productoId: number;

  @ApiPropertyOptional({ description: 'Cantidad vendida (default: 1)', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad?: number;

  @ApiPropertyOptional({ description: 'Precio unitario al momento de la venta (se toma del producto si no se especifica)', example: 15.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioUnitario?: number;

  @ApiPropertyOptional({ description: 'Descuento aplicado al item', example: 5.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  descuento?: number;
}
