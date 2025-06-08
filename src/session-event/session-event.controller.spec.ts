import { Test, TestingModule } from '@nestjs/testing';
import { SessionEventController } from './session-event.controller';
import { SessionEventService } from './session-event.service';

describe('SessionEventController', () => {
  let controller: SessionEventController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionEventController],
      providers: [SessionEventService],
    }).compile();

    controller = module.get<SessionEventController>(SessionEventController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
