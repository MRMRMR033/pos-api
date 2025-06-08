import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Se llama cuando Nest arranca el módulo
  async onModuleInit() {
    await this.$connect();
  }

  // Se llama cuando Nest destruye el módulo (shutdown)
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
