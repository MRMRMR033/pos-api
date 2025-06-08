import { ApiProperty } from '@nestjs/swagger';

export class TicketItemEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ticketId: number;

  @ApiProperty()
  productoId: number;

  @ApiProperty()
  cantidad: number;

  @ApiProperty({ format: 'float' })
  precioUnitario: number;

  @ApiProperty({ format: 'float' })
  total: number;
}
