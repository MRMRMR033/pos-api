import { IsInt, IsEnum, IsNumber, Min, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovimientoTipo } from '../../../generated/prisma';

export class CreateCashMovementDto {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  @IsInt()
  usuarioId: number;

  @ApiProperty({ description: 'Tipo de movimiento', enum: MovimientoTipo, example: MovimientoTipo.IN })
  @IsEnum(MovimientoTipo)
  tipo: MovimientoTipo;

  @ApiProperty({ description: 'Monto de la operación', example: 500.0 })
  @IsNumber() @Min(0)
  monto: number;

  @ApiPropertyOptional({ description: 'Descripción (opcional)', example: 'Efectivo inicial' })
  @IsString() @IsOptional()
  descripcion?: string;
}
