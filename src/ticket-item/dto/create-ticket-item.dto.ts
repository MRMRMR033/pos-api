import { Type } from 'class-transformer';
import { IsInt, Min, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketItemDto {
  @ApiProperty({ description: 'ID del ticket', example: 1 })
  @Type(() => Number)
  @IsInt()
  ticketId: number;

  @ApiProperty({ description: 'ID del producto', example: 10 })
  @Type(() => Number)
  @IsInt()
  productoId: number;

  @ApiProperty({ description: 'Cantidad vendida', example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiProperty({ description: 'Precio unitario al momento de la venta', example: 15.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioUnitario: number;
}
