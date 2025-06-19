import { IsDecimal, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AbrirCajaDto {
  @ApiProperty({ description: 'Saldo inicial en caja', example: 1000.00 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El saldo inicial debe ser un número válido con máximo 2 decimales' })
  @Min(0, { message: 'El saldo inicial no puede ser negativo' })
  saldoInicial: number;

  @ApiPropertyOptional({ description: 'ID de la caja (default: 1)', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'El ID de caja debe ser un número positivo' })
  cajaId?: number;

  @ApiPropertyOptional({ description: 'Observaciones de apertura' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}