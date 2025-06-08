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
import { VentaModule } from './venta/venta.module';
import { CashMovementModule } from './cash-movement/cash-movement.module';
import { SessionEventModule } from './session-event/session-event.module';
import { ReportModule } from './report/report.module';

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

    // Módulo de tickets (ventas)
    VentaModule,

    // Módulos de eventos y finanzas
    CashMovementModule,
    SessionEventModule,

    // Módulo de reportes
    ReportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
