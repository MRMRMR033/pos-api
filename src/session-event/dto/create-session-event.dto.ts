import { Type } from 'class-transformer';
import { IsInt, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventoTipo } from '../../../generated/prisma';

export class CreateSessionEventDto {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  @Type(() => Number)
  @IsInt()
  usuarioId: number;

  @ApiProperty({ description: 'Tipo de evento', enum: EventoTipo, example: EventoTipo.LOGIN })
  @IsEnum(EventoTipo)
  tipo: EventoTipo;

  @ApiPropertyOptional({ description: 'Timestamp del evento (por defecto ahora)' })
  @IsDateString()
  @IsOptional()
  timestamp?: string;
}
