// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductoModule } from './producto/producto.module';
import { CategoriaModule } from './categoria/categoria.module';
import { ProveedorModule } from './proveedor/proveedor.module';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { TicketModule } from './ticket/ticket.module';
import { CashMovementModule } from './cash-movement/cash-movement.module';
import { SessionEventModule } from './session-event/session-event.module';
import { ReportModule } from './report/report.module';
import { TicketItemModule } from './ticket-item/ticket-item.module';

@Module({
  imports: [
    // Módulo de acceso a la base de datos Prisma
    PrismaModule,

    // Módulos de dominio
    ProductoModule,
    CategoriaModule,
    ProveedorModule,
    UsuarioModule,

    // Módulo de autenticación
    AuthModule,

    // Módulo de tickets (ticket)
    TicketModule,

    // Módulos de eventos y finanzas
    CashMovementModule,
    SessionEventModule,

    // Módulo de reportes
    ReportModule,

    TicketItemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
