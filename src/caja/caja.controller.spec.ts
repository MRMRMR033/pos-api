import { Test, TestingModule } from '@nestjs/testing';
import { CajaController } from './caja.controller';
import { CajaService } from './caja.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

describe('CajaController', () => {
  let controller: CajaController;
  let service: CajaService;

  const mockCajaService = {
    abrir: jest.fn(),
    cerrar: jest.fn(),
    getTurnoActual: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getMovimientosCaja: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CajaController],
      providers: [
        {
          provide: CajaService,
          useValue: mockCajaService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CajaController>(CajaController);
    service = module.get<CajaService>(CajaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('abrir', () => {
    it('should open a cash register shift', async () => {
      const abrirDto = {
        saldoInicial: 1000,
        cajaId: 1,
        observaciones: 'Inicio de turno',
      };
      const req = { user: { id: 1 } };

      mockCajaService.abrir.mockResolvedValue({
        id: 1,
        usuarioId: 1,
        saldoInicial: 1000,
        estado: 'ABIERTO',
      });

      const result = await controller.abrir(abrirDto, req);

      expect(service.abrir).toHaveBeenCalledWith(abrirDto, 1);
      expect(result).toEqual({
        id: 1,
        usuarioId: 1,
        saldoInicial: 1000,
        estado: 'ABIERTO',
      });
    });
  });

  describe('cerrar', () => {
    it('should close a cash register shift with final count', async () => {
      const cerrarDto = {
        saldoFinal: 1500,
        observaciones: 'Cierre de turno',
      };
      const req = { user: { id: 1 } };

      mockCajaService.cerrar.mockResolvedValue({
        id: 1,
        usuarioId: 1,
        saldoInicial: 1000,
        saldoFinal: 1500,
        diferencia: 0,
        estado: 'CERRADO',
      });

      const result = await controller.cerrar(1, cerrarDto, req);

      expect(service.cerrar).toHaveBeenCalledWith(1, cerrarDto, 1);
      expect(result).toEqual({
        id: 1,
        usuarioId: 1,
        saldoInicial: 1000,
        saldoFinal: 1500,
        diferencia: 0,
        estado: 'CERRADO',
      });
    });
  });

  describe('getTurnoActual', () => {
    it('should return current shift with summary', async () => {
      const req = { user: { id: 1 } };

      mockCajaService.getTurnoActual.mockResolvedValue({
        id: 1,
        saldoInicial: 1000,
        resumen: {
          saldoActual: 1250,
          totalIngresos: 500,
          totalEgresos: 250,
          ventasRealizadas: 10,
        },
      });

      const result = await controller.getTurnoActual(req);

      expect(service.getTurnoActual).toHaveBeenCalledWith(1);
      expect(result.resumen.saldoActual).toBe(1250);
    });
  });
});