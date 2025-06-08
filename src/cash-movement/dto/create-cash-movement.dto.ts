import { Type } from 'class-transformer';
import { IsInt, IsEnum, IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovimientoTipo } from '../../../generated/prisma';

export class CreateCashMovementDto {
  @ApiProperty({ description: 'ID del usuario que registra', example: 1 })
  @Type(() => Number)
  @IsInt()
  usuarioId: number;

  @ApiProperty({ description: 'Tipo de movimiento', enum: MovimientoTipo, example: MovimientoTipo.IN })
  @IsEnum(MovimientoTipo)
  tipo: MovimientoTipo;

  @ApiProperty({ description: 'Monto del movimiento', example: 500.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto: number;

  @ApiPropertyOptional({ description: 'Descripción opcional', example: 'Efectivo inicial' })
  @IsString()
  @IsOptional()
  descripcion?: string;
}
