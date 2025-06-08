import { IsInt, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVentaDto {
  @ApiProperty({ description: 'ID del usuario que genera la venta', example: 1 })
  @IsInt()
  usuarioId: number;

  @ApiProperty({ description: 'Número de ticket (reinicia cada día)', example: 1 })
  @IsInt() @Min(1)
  numeroTicket: number;

  @ApiPropertyOptional({ description: 'Fecha de la venta (opcional, por defecto ahora)', example: '2025-06-08T12:34:56.789Z' })
  @IsDateString() @IsOptional()
  fecha?: string;
}
