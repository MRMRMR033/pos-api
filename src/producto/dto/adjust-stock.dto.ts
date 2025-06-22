import { IsInt, IsString, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StockAdjustmentType {
  ENTRADA = 'entrada',
  SALIDA = 'salida', 
  AJUSTE = 'ajuste'
}

export class AdjustStockDto {
  @ApiProperty({
    example: 10,
    description: 'Cantidad a ajustar (para entrada/salida) o nuevo stock total (para ajuste)',
    minimum: 0
  })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(0, { message: 'La cantidad debe ser mayor o igual a 0' })
  cantidad: number;

  @ApiProperty({
    enum: StockAdjustmentType,
    example: StockAdjustmentType.ENTRADA,
    description: 'Tipo de ajuste: entrada (+), salida (-), o ajuste (=)'
  })
  @IsEnum(StockAdjustmentType, { message: 'Tipo de ajuste inválido' })
  tipo: StockAdjustmentType;

  @ApiProperty({
    example: 'Recepción de mercancía',
    description: 'Motivo del ajuste de stock',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser texto' })
  motivo?: string;
}