import { Test, TestingModule } from '@nestjs/testing';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';

describe('ReportesController', () => {
  let controller: ReportesController;
  let service: ReportesService;

  const mockReportesService = {
    reporteVentas: jest.fn(),
    reporteInventario: jest.fn(),
    reporteFinanciero: jest.fn(),
    reporteProductosVendidos: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportesController],
      providers: [
        {
          provide: ReportesService,
          useValue: mockReportesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReportesController>(ReportesController);
    service = module.get<ReportesService>(ReportesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('reporteVentas', () => {
    it('should return sales report', async () => {
      const expected = {
        periodo: { desde: '2024-01-01', hasta: '2024-01-31' },
        resumen: {
          totalTickets: 100,
          subtotal: 10000,
          impuestos: 1600,
          descuentos: 500,
          total: 11100,
        },
        ventasPorDia: [],
        productosTopVentas: [],
      };

      mockReportesService.reporteVentas.mockResolvedValue(expected);

      const result = await controller.reporteVentas('2024-01-01', '2024-01-31');

      expect(service.reporteVentas).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(result).toEqual(expected);
    });
  });

  describe('reporteInventario', () => {
    it('should return inventory report', async () => {
      const expected = {
        resumen: {
          totalProductos: 500,
          productosConStock: 450,
          productosAgotados: 25,
          productosStockBajo: 75,
          valorTotalInventario: 125000,
        },
        stockBajo: [],
        productos: [],
      };

      mockReportesService.reporteInventario.mockResolvedValue(expected);

      const result = await controller.reporteInventario();

      expect(service.reporteInventario).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('reporteFinanciero', () => {
    it('should return financial report', async () => {
      const expected = {
        periodo: { desde: '2024-01-01', hasta: '2024-01-31' },
        resumen: {
          totalIngresos: 50000,
          totalEgresos: 5000,
          utilidadBruta: 45000,
          margenUtilidad: 90,
        },
        desglose: {},
        ventasPorDia: [],
        turnosCerrados: [],
      };

      mockReportesService.reporteFinanciero.mockResolvedValue(expected);

      const result = await controller.reporteFinanciero('2024-01-01', '2024-01-31');

      expect(service.reporteFinanciero).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(result).toEqual(expected);
    });
  });

  describe('reporteProductosVendidos', () => {
    it('should return best selling products report', async () => {
      const expected = {
        periodo: { desde: '2024-01-01', hasta: '2024-01-01' },
        productos: [
          {
            producto: { id: 1, nombre: 'Producto A' },
            cantidadVendida: 50,
            totalVentas: 1000,
          },
        ],
        resumen: {
          totalProductosVendidos: 1,
          cantidadTotalVendida: 50,
          ventasTotales: 1000,
        },
      };

      mockReportesService.reporteProductosVendidos.mockResolvedValue(expected);

      const result = await controller.reporteProductosVendidos('2024-01-01', '2024-01-01', 50);

      expect(service.reporteProductosVendidos).toHaveBeenCalledWith('2024-01-01', '2024-01-01', 50);
      expect(result).toEqual(expected);
    });
  });
});