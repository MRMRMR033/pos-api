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
    console.log('\n📊 [REPORTES] GET /reportes/ventas');
    console.log('📥 Query:', { desde, hasta });
    
    try {
      if (desde && isNaN(Date.parse(desde))) {
        throw new BadRequestException('Formato de fecha inválido para "desde". Use YYYY-MM-DD');
      }
      
      if (hasta && isNaN(Date.parse(hasta))) {
        throw new BadRequestException('Formato de fecha inválido para "hasta". Use YYYY-MM-DD');
      }

      const result = this.reportesService.reporteVentas(desde, hasta);
      console.log('✅ Sales report generated successfully:', { period: { desde, hasta } });
      return result;
    } catch (error) {
      console.log('❌ Sales report generation failed:', error.message);
      throw error;
    }
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
    console.log('\n📊 [REPORTES] GET /reportes/inventario');
    
    try {
      const result = this.reportesService.reporteInventario();
      console.log('✅ Inventory report generated successfully');
      return result;
    } catch (error) {
      console.log('❌ Inventory report generation failed:', error.message);
      throw error;
    }
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
    console.log('\n📊 [REPORTES] GET /reportes/financieros');
    console.log('📥 Query:', { desde, hasta });
    
    try {
      if (desde && isNaN(Date.parse(desde))) {
        throw new BadRequestException('Formato de fecha inválido para "desde". Use YYYY-MM-DD');
      }
      
      if (hasta && isNaN(Date.parse(hasta))) {
        throw new BadRequestException('Formato de fecha inválido para "hasta". Use YYYY-MM-DD');
      }

      const result = this.reportesService.reporteFinanciero(desde, hasta);
      console.log('✅ Financial report generated successfully:', { period: { desde, hasta } });
      return result;
    } catch (error) {
      console.log('❌ Financial report generation failed:', error.message);
      throw error;
    }
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
    console.log('\n📊 [REPORTES] GET /reportes/productos-vendidos');
    console.log('📥 Query:', { desde, hasta, limit });
    
    try {
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

      const result = this.reportesService.reporteProductosVendidos(desde, hasta, limitNum);
      console.log('✅ Products sold report generated successfully:', { period: { desde, hasta }, limit: limitNum });
      return result;
    } catch (error) {
      console.log('❌ Products sold report generation failed:', error.message);
      throw error;
    }
  }

  @Get('ventas-por-hora')
  @RequirePermission(PERMISSIONS.REPORTS_READ)
  @ApiOperation({ 
    summary: 'Reporte de ventas agrupadas por hora',
    description: 'Muestra el rendimiento de ventas por cada hora del día con desglose por vendedor'
  })
  @ApiQuery({ name: 'desde', required: false, description: 'Fecha inicio (YYYY-MM-DD). Default: hoy' })
  @ApiQuery({ name: 'hasta', required: false, description: 'Fecha fin (YYYY-MM-DD). Default: hoy' })
  @ApiQuery({ name: 'usuarioId', required: false, description: 'Filtrar por vendedor específico (opcional)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte de ventas por hora',
    schema: {
      type: 'object',
      properties: {
        periodo: {
          type: 'object',
          properties: {
            desde: { type: 'string', example: '2024-01-01' },
            hasta: { type: 'string', example: '2024-01-01' }
          }
        },
        resumen: {
          type: 'object',
          properties: {
            totalVentas: { type: 'number', example: 5000.00 },
            totalTickets: { type: 'number', example: 50 },
            ticketPromedio: { type: 'number', example: 100.00 },
            horasConVentas: { type: 'number', example: 12 },
            mejorHora: {
              type: 'object',
              properties: {
                hora: { type: 'number', example: 14 },
                totalVentas: { type: 'number', example: 800.00 }
              }
            }
          }
        },
        ventasPorHora: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              fecha: { type: 'string', example: '2024-01-01' },
              hora: { type: 'number', example: 14 },
              totalVentas: { type: 'number', example: 800.00 },
              cantidadTickets: { type: 'number', example: 8 },
              ticketPromedio: { type: 'number', example: 100.00 },
              usuarios: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    usuarioId: { type: 'number', example: 1 },
                    fullName: { type: 'string', example: 'Juan Pérez' },
                    totalVentas: { type: 'number', example: 400.00 },
                    cantidadTickets: { type: 'number', example: 4 }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Formato de fecha inválido' })
  reporteVentasPorHora(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('usuarioId', ParseIntPipe) usuarioId?: number,
  ) {
    console.log('\n📊 [REPORTES] GET /reportes/ventas-por-hora');
    console.log('📥 Query:', { desde, hasta, usuarioId });
    
    try {
      if (desde && isNaN(Date.parse(desde))) {
        throw new BadRequestException('Formato de fecha inválido para "desde". Use YYYY-MM-DD');
      }
      
      if (hasta && isNaN(Date.parse(hasta))) {
        throw new BadRequestException('Formato de fecha inválido para "hasta". Use YYYY-MM-DD');
      }

      const result = this.reportesService.reporteVentasPorHora(desde, hasta, usuarioId);
      console.log('✅ Hourly sales report generated successfully:', { period: { desde, hasta }, usuarioId });
      return result;
    } catch (error) {
      console.log('❌ Hourly sales report generation failed:', error.message);
      throw error;
    }
  }

  @Get('ventas-por-vendedor')
  @RequirePermission(PERMISSIONS.REPORTS_READ)
  @ApiOperation({ 
    summary: 'Reporte de rendimiento por vendedor',
    description: 'Análisis de ventas por cada vendedor con métricas de rendimiento y horarios más productivos'
  })
  @ApiQuery({ name: 'desde', required: false, description: 'Fecha inicio (YYYY-MM-DD). Default: hoy' })
  @ApiQuery({ name: 'hasta', required: false, description: 'Fecha fin (YYYY-MM-DD). Default: hoy' })
  @ApiQuery({ name: 'usuarioIds', required: false, description: 'IDs de vendedores específicos separados por coma (opcional)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte de ventas por vendedor',
    schema: {
      type: 'object',
      properties: {
        periodo: {
          type: 'object',
          properties: {
            desde: { type: 'string', example: '2024-01-01' },
            hasta: { type: 'string', example: '2024-01-01' }
          }
        },
        resumen: {
          type: 'object',
          properties: {
            totalVendedores: { type: 'number', example: 5 },
            vendedoresConVentas: { type: 'number', example: 3 },
            vendedoresSinVentas: { type: 'number', example: 2 },
            totalVentas: { type: 'number', example: 5000.00 },
            totalTickets: { type: 'number', example: 50 },
            ticketPromedio: { type: 'number', example: 100.00 },
            mejorVendedor: {
              type: 'object',
              properties: {
                usuarioId: { type: 'number', example: 1 },
                fullName: { type: 'string', example: 'Juan Pérez' },
                totalVentas: { type: 'number', example: 2000.00 }
              }
            }
          }
        },
        vendedoresConVentas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              usuarioId: { type: 'number', example: 1 },
              fullName: { type: 'string', example: 'Juan Pérez' },
              email: { type: 'string', example: 'juan@empresa.com' },
              totalVentas: { type: 'number', example: 2000.00 },
              cantidadTickets: { type: 'number', example: 20 },
              ticketPromedio: { type: 'number', example: 100.00 },
              ventasPorHora: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    hora: { type: 'number', example: 14 },
                    totalVentas: { type: 'number', example: 400.00 },
                    cantidadTickets: { type: 'number', example: 4 }
                  }
                }
              },
              primerVenta: { type: 'string', example: '2024-01-01T08:00:00Z' },
              ultimaVenta: { type: 'string', example: '2024-01-01T18:00:00Z' },
              mejorHora: {
                type: 'object',
                properties: {
                  hora: { type: 'number', example: 14 },
                  totalVentas: { type: 'number', example: 400.00 }
                }
              }
            }
          }
        },
        vendedoresSinVentas: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              usuarioId: { type: 'number', example: 3 },
              fullName: { type: 'string', example: 'María López' },
              email: { type: 'string', example: 'maria@empresa.com' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Formato de fecha inválido' })
  reporteVentasPorVendedor(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('usuarioIds') usuarioIdsStr?: string,
  ) {
    console.log('\n📊 [REPORTES] GET /reportes/ventas-por-vendedor');
    console.log('📥 Query:', { desde, hasta, usuarioIdsStr });
    
    try {
      if (desde && isNaN(Date.parse(desde))) {
        throw new BadRequestException('Formato de fecha inválido para "desde". Use YYYY-MM-DD');
      }
      
      if (hasta && isNaN(Date.parse(hasta))) {
        throw new BadRequestException('Formato de fecha inválido para "hasta". Use YYYY-MM-DD');
      }

      let usuarioIds: number[] | undefined = undefined;
      if (usuarioIdsStr) {
        try {
          usuarioIds = usuarioIdsStr.split(',').map(id => {
            const num = parseInt(id.trim());
            if (isNaN(num)) {
              throw new Error(`ID inválido: ${id}`);
            }
            return num;
          });
        } catch (error) {
          throw new BadRequestException('usuarioIds debe ser una lista de números separados por coma (ej: "1,2,3")');
        }
      }

      const result = this.reportesService.reporteVentasPorVendedor(desde, hasta, usuarioIds);
      console.log('✅ Salesperson sales report generated successfully:', { period: { desde, hasta }, usuarioIds });
      return result;
    } catch (error) {
      console.log('❌ Salesperson sales report generation failed:', error.message);
      throw error;
    }
  }
}