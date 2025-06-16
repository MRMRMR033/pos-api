import { Module } from '@nestjs/common';
import { InitializationService } from './initialization.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InitializationService],
  exports: [InitializationService],
})
export class InitializationModule {}