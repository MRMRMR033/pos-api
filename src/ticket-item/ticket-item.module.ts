import { Module } from '@nestjs/common';
import { TicketItemService } from './ticket-item.service';
import { TicketItemController } from './ticket-item.controller';

@Module({
  providers: [TicketItemService],
  controllers: [TicketItemController]
})
export class TicketItemModule {}
