import { IsArray, IsDateString, IsNumber, IsOptional, IsString, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTicketItemDto } from '../../ticket-item/dto/create-ticket-item.dto';

export class CreateEnhancedTicketDto {
  @ApiPropertyOptional({ description: 'ID del usuario que realiza la venta (se toma automáticamente del JWT)' })
  @IsOptional()
  @IsNumber()
  usuarioId?: number;


  @ApiPropertyOptional({ description: 'ID del turno de caja actual' })
  @IsOptional()
  @IsNumber()
  turnoCajaId?: number;

  @ApiPropertyOptional({ description: 'Fecha del ticket (ISO string)' })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiProperty({ 
    description: 'Items del ticket',
    type: [CreateTicketItemDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTicketItemDto)
  items: CreateTicketItemDto[];

  @ApiPropertyOptional({ description: 'Descuento manual aplicado al ticket', example: 50.00 })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El descuento no puede ser negativo' })
  descuentoManual?: number;

  @ApiPropertyOptional({ description: 'Recargo manual aplicado al ticket', example: 25.00 })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El recargo no puede ser negativo' })
  recargoManual?: number;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}