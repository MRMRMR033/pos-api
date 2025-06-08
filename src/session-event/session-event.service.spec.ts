import { Test, TestingModule } from '@nestjs/testing';
import { SessionEventService } from './session-event.service';

describe('SessionEventService', () => {
  let service: SessionEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionEventService],
    }).compile();

    service = module.get<SessionEventService>(SessionEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
