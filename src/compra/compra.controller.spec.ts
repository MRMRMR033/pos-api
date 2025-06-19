import { Test, TestingModule } from '@nestjs/testing';
import { CompraController } from './compra.controller';
import { CompraService } from './compra.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

describe('CompraController', () => {
  let controller: CompraController;
  let service: CompraService;

  const mockCompraService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    recibir: jest.fn(),
    findByProveedor: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompraController],
      providers: [
        {
          provide: CompraService,
          useValue: mockCompraService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CompraController>(CompraController);
    service = module.get<CompraService>(CompraService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new purchase order', async () => {
      const createDto = {
        numeroOrden: 'ORD-001',
        proveedorId: 1,
        detalles: [
          {
            productoId: 1,
            cantidad: 10,
            precioUnitario: 50.0,
          },
        ],
      };
      const req = { user: { id: 1 } };

      mockCompraService.create.mockResolvedValue({ id: 1, ...createDto });

      const result = await controller.create(createDto, req);

      expect(service.create).toHaveBeenCalledWith(createDto, 1);
      expect(result).toEqual({ id: 1, ...createDto });
    });
  });

  describe('findAll', () => {
    it('should return paginated purchase orders', async () => {
      const expected = {
        data: [{ id: 1, numeroOrden: 'ORD-001' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };

      mockCompraService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll('1', '10');

      expect(service.findAll).toHaveBeenCalledWith(1, 10, undefined);
      expect(result).toEqual(expected);
    });
  });

  describe('recibir', () => {
    it('should receive a purchase order and update inventory', async () => {
      const recibirDto = {
        detalles: [
          {
            detalleId: 1,
            cantidadRecibida: 10,
          },
        ],
      };
      const req = { user: { id: 1 } };

      mockCompraService.recibir.mockResolvedValue({ id: 1, estado: 'RECIBIDA' });

      const result = await controller.recibir(1, recibirDto, req);

      expect(service.recibir).toHaveBeenCalledWith(1, recibirDto, 1);
      expect(result).toEqual({ id: 1, estado: 'RECIBIDA' });
    });
  });
});