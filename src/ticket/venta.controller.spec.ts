import { Test, TestingModule } from '@nestjs/testing';
import { VentaController } from './ticket.controller';
import { VentaService } from './ticket.service';

describe('VentaController', () => {
  let controller: VentaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VentaController],
      providers: [VentaService],
    }).compile();

    controller = module.get<VentaController>(VentaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
