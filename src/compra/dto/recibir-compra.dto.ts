import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecibirDetalleDto {
  @ApiProperty({ description: 'ID del detalle de la orden' })
  @IsNumber()
  detalleId: number;

  @ApiProperty({ description: 'Cantidad recibida' })
  @IsNumber()
  cantidadRecibida: number;
}

export class RecibirCompraDto {
  @ApiProperty({ 
    description: 'Detalles de productos recibidos',
    type: [RecibirDetalleDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecibirDetalleDto)
  detalles: RecibirDetalleDto[];

  @ApiPropertyOptional({ description: 'Observaciones sobre la recepción' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}