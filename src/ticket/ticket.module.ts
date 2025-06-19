import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { EnhancedTicketService } from './enhanced-ticket.service';
import { VentasController } from './ventas.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TicketController, VentasController],
  providers: [TicketService, EnhancedTicketService],
  exports: [TicketService, EnhancedTicketService],
})
export class TicketModule {}
