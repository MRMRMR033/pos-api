import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CerrarCajaDto {
  @ApiProperty({ description: 'Saldo final contado físicamente', example: 1500.00 })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El saldo final debe ser un número válido con máximo 2 decimales' })
  @Min(0, { message: 'El saldo final no puede ser negativo' })
  saldoFinal: number;

  @ApiPropertyOptional({ description: 'Observaciones de cierre' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}