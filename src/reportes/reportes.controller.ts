import { 
  Controller, 
  Get, 
  Query, 
  UseGuards,
  BadRequestException,
  ParseIntPipe 
} from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { PERMISSIONS } from '../auth/permissions.constants';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reportes')
@ApiBearerAuth()
@Controller('reportes')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('ventas')
  @RequirePermission(PERMISSIONS.REPORTS_READ)
  @ApiOperation({ 
    summary: 'Reporte de ventas con totales, subtotales, impuestos y descuentos',
    description: 'Genera un reporte completo de ventas con análisis por día, productos top, y rendimiento por vendedor'
  })
  @ApiQuery({ name: 'desde', required: false, description: 'Fecha inicio (YYYY-MM-DD). Default: hoy' })
  @ApiQuery({ name: 'hasta', required: false, description: 'Fecha fin (YYYY-MM-DD). Default: hoy' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte de ventas listo para exportar a PDF o Excel',
    schema: {
      type: 'object',
      properties: {
        periodo: {
          type: 'object',
          properties: {
            desde: { type: 'string', example: '2024-01-01' },
            hasta: { type: 'string', example: '2024-01-31' }
          }
        },
        resumen: {
          type: 'object',
          properties: {
            totalTickets: { type: 'number', example: 150 },
            subtotal: { type: 'number', example: 12500.00 },
            impuestos: { type: 'number', example: 2000.00 },
            descuentos: { type: 'number', example: 500.00 },
            total: { type: 'number', example: 14000.00 },
            ticketPromedio: { type: 'number', example: 93.33 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Formato de fecha inválido' })
  reporteVentas(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    if (desde && isNaN(Date.parse(desde))) {
      throw new BadRequestException('Formato de fecha inválido para "desde". Use YYYY-MM-DD');
    }
    
    if (hasta && isNaN(Date.parse(hasta))) {
      throw new BadRequestException('Formato de fecha inválido para "hasta". Use YYYY-MM-DD');
    }

    return this.reportesService.reporteVentas(desde, hasta);
  }

  @Get('inventario')
  @RequirePermission(PERMISSIONS.REPORTS_READ)
  @ApiOperation({ 
    summary: 'Reporte de inventario con stock actual y alertas de stock mínimo',
    description: 'Muestra el estado completo del inventario, productos con stock bajo, valor total del inventario y movimientos recientes'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte de inventario completo',
    schema: {
      type: 'object',
      properties: {
        resumen: {
          type: 'object',
          properties: {
            totalProductos: { type: 'number', example: 500 },
            productosConStock: { type: 'number', example: 450 },
            productosAgotados: { type: 'number', example: 25 },
            productosStockBajo: { type: 'number', example: 75 },
            valorTotalInventario: { type: 'number', example: 125000.00 }
          }
        },
        stockBajo: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              nombre: { type: 'string' },
              stock: { type: 'number' },
              stockMinimo: { type: 'number' },
              estado: { type: 'string', enum: ['AGOTADO', 'STOCK_BAJO'] }
            }
          }
        }
      }
    }
  })
  reporteInventario() {
    return this.reportesService.reporteInventario();
  }

  @Get('financieros')
  @RequirePermission(PERMISSIONS.REPORTS_READ)
  @ApiOperation({ 
    summary: 'Reporte financiero con ingresos vs egresos por caja y período',
    description: 'Análisis financiero completo con turnos de caja, movimientos de efectivo y utilidades'
  })
  @ApiQuery({ name: 'desde', required: false, description: 'Fecha inicio (YYYY-MM-DD). Default: inicio del mes actual' })
  @ApiQuery({ name: 'hasta', required: false, description: 'Fecha fin (YYYY-MM-DD). Default: fin del mes actual' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte financiero listo para exportar',
    schema: {
      type: 'object',
      properties: {
        periodo: {
          type: 'object',
          properties: {
            desde: { type: 'string', example: '2024-01-01' },
            hasta: { type: 'string', example: '2024-01-31' }
          }
        },
        resumen: {
          type: 'object',
          properties: {
            totalIngresos: { type: 'number', example: 50000.00 },
            totalEgresos: { type: 'number', example: 5000.00 },
            utilidadBruta: { type: 'number', example: 45000.00 },
            margenUtilidad: { type: 'number', example: 90.00 }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Formato de fecha inválido' })
  reporteFinanciero(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    if (desde && isNaN(Date.parse(desde))) {
      throw new BadRequestException('Formato de fecha inválido para "desde". Use YYYY-MM-DD');
    }
    
    if (hasta && isNaN(Date.parse(hasta))) {
      throw new BadRequestException('Formato de fecha inválido para "hasta". Use YYYY-MM-DD');
    }

    return this.reportesService.reporteFinanciero(desde, hasta);
  }

  @Get('productos-vendidos')
  @RequirePermission(PERMISSIONS.REPORTS_READ)
  @ApiOperation({ 
    summary: 'Reporte de productos más vendidos',
    description: 'Lista de productos ordenados por cantidad vendida con detalles de ventas'
  })
  @ApiQuery({ name: 'desde', required: false, description: 'Fecha inicio (YYYY-MM-DD). Default: hoy' })
  @ApiQuery({ name: 'hasta', required: false, description: 'Fecha fin (YYYY-MM-DD). Default: hoy' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número máximo de productos (default: 50)' })
  @ApiResponse({ status: 200, description: 'Lista de productos más vendidos' })
  @ApiResponse({ status: 400, description: 'Formato de fecha inválido' })
  reporteProductosVendidos(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('limit', ParseIntPipe) limit?: number,
  ) {
    if (desde && isNaN(Date.parse(desde))) {
      throw new BadRequestException('Formato de fecha inválido para "desde". Use YYYY-MM-DD');
    }
    
    if (hasta && isNaN(Date.parse(hasta))) {
      throw new BadRequestException('Formato de fecha inválido para "hasta". Use YYYY-MM-DD');
    }

    const limitNum = limit || 50;
    if (limitNum < 1 || limitNum > 500) {
      throw new BadRequestException('Limit debe estar entre 1 y 500');
    }

    return this.reportesService.reporteProductosVendidos(desde, hasta, limitNum);
  }
}