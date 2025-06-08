import { Test, TestingModule } from '@nestjs/testing';
import { TicketItemService } from './ticket-item.service';

describe('TicketItemService', () => {
  let service: TicketItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketItemService],
    }).compile();

    service = module.get<TicketItemService>(TicketItemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
