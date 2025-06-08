import { Module } from '@nestjs/common';
import { SessionEventService } from './session-event.service';
import { SessionEventController } from './session-event.controller';

@Module({
  controllers: [SessionEventController],
  providers: [SessionEventService],
})
export class SessionEventModule {}
