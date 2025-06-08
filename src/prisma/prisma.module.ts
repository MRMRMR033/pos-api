import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()            // 1️⃣ Marca este módulo como global
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 2️⃣ Exporta el servicio para inyección
})
export class PrismaModule {}
