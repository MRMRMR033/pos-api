import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { EnhancedTicketService } from './enhanced-ticket.service';
import { CreateEnhancedTicketDto } from './dto/create-enhanced-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { PERMISSIONS } from '../auth/permissions.constants';

@ApiTags('Ventas')
@ApiBearerAuth()
@Controller('ventas')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class VentasController {
  constructor(private readonly ventasService: EnhancedTicketService) {}

  @Post()
  @RequirePermission(PERMISSIONS.VENTAS_CREAR)
  @ApiOperation({ 
    summary: 'Crear nueva venta/ticket',
    description: 'Crea una nueva venta con cálculo automático de totales, descuento de stock y registro de movimientos'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Venta creada exitosamente',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        numeroTicket: { type: 'number', example: 1 },
        usuarioId: { type: 'number', example: 1 },
        turnoCajaId: { type: 'number', example: 1, nullable: true },
        fecha: { type: 'string', example: '2024-01-01T10:30:00.000Z' },
        subtotal: { type: 'number', example: 100.00 },
        impuestos: { type: 'number', example: 16.00 },
        descuentoTotal: { type: 'number', example: 5.00 },
        total: { type: 'number', example: 111.00 },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              productoId: { type: 'number' },
              cantidad: { type: 'number' },
              precioUnitario: { type: 'number' },
              descuento: { type: 'number' },
              impuesto: { type: 'number' },
              total: { type: 'number' },
              producto: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  nombre: { type: 'string' },
                  codigoBarras: { type: 'string' }
                }
              }
            }
          }
        },
        usuario: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            fullName: { type: 'string' }
          }
        },
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o stock insuficiente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permisos' })
  async crear(@Body() createVentaDto: CreateEnhancedTicketDto, @Req() req: any) {
    // El usuarioId se toma del JWT para mayor seguridad
    const ventaData = {
      ...createVentaDto,
      usuarioId: req.user.id, // Sobreescribir con el usuario del token
    };

    // Validar que hay items
    if (!ventaData.items || ventaData.items.length === 0) {
      throw new BadRequestException('La venta debe tener al menos un item');
    }

    // Si se especifica turnoCajaId, verificar que el usuario tenga un turno abierto
    if (ventaData.turnoCajaId) {
      // Esta validación podría agregarse aquí si es necesaria
    }

    return this.ventasService.create(ventaData);
  }

  @Get()
  @RequirePermission(PERMISSIONS.VENTAS_VER_TODAS, PERMISSIONS.VENTAS_VER_PROPIAS)
  @ApiOperation({ 
    summary: 'Listar ventas con filtros y paginación',
    description: 'Obtiene una lista paginada de ventas con filtros opcionales'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Límite por página (default: 10)' })
  @ApiQuery({ name: 'usuarioId', required: false, type: Number, description: 'Filtrar por usuario' })
  @ApiQuery({ name: 'desde', required: false, type: String, description: 'Fecha inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'hasta', required: false, type: String, description: 'Fecha fin (YYYY-MM-DD)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de ventas con paginación',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              numeroTicket: { type: 'number' },
              fecha: { type: 'string' },
              total: { type: 'number' },
              usuario: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  fullName: { type: 'string' }
                }
              },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    cantidad: { type: 'number' },
                    precioUnitario: { type: 'number' },
                    total: { type: 'number' },
                    producto: {
                      type: 'object',
                      properties: {
                        nombre: { type: 'string' },
                        codigoBarras: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' }
          }
        }
      }
    }
  })
  async listar(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const userIdNum = usuarioId ? parseInt(usuarioId) : undefined;

    // Validaciones
    if (pageNum < 1 || limitNum < 1) {
      throw new BadRequestException('Page y limit deben ser números positivos');
    }

    if (usuarioId && isNaN(userIdNum!)) {
      throw new BadRequestException('usuarioId debe ser un número válido');
    }


    if (desde && isNaN(Date.parse(desde))) {
      throw new BadRequestException('Formato de fecha inválido para "desde". Use YYYY-MM-DD');
    }

    if (hasta && isNaN(Date.parse(hasta))) {
      throw new BadRequestException('Formato de fecha inválido para "hasta". Use YYYY-MM-DD');
    }

    // Si el usuario no tiene permiso para ver todas las ventas, solo puede ver las propias
    let finalUserId = userIdNum;
    if (!req.user.permissions?.includes(PERMISSIONS.VENTAS_VER_TODAS)) {
      finalUserId = req.user.id; // Forzar a que solo vea sus propias ventas
    }

    return this.ventasService.findAll(pageNum, limitNum, finalUserId, desde, hasta);
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.VENTAS_VER_TODAS, PERMISSIONS.VENTAS_VER_PROPIAS)
  @ApiOperation({ 
    summary: 'Obtener venta por ID',
    description: 'Obtiene los detalles completos de una venta específica'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la venta' })
  @ApiResponse({ 
    status: 200, 
    description: 'Detalles completos de la venta',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        numeroTicket: { type: 'number' },
        usuarioId: { type: 'number' },
        turnoCajaId: { type: 'number', nullable: true },
        fecha: { type: 'string' },
        subtotal: { type: 'number' },
        impuestos: { type: 'number' },
        descuentoTotal: { type: 'number' },
        total: { type: 'number' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        items: {
          type: 'array',
          description: 'Productos vendidos con detalles completos'
        },
        usuario: { type: 'object', description: 'Información del vendedor' },
        turnoCaja: { type: 'object', nullable: true, description: 'Información del turno de caja' },
        calculatedTotals: {
          type: 'object',
          description: 'Totales calculados para verificación'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async obtenerPorId(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const venta = await this.ventasService.findOneWithDetails(id);
    
    // Si el usuario no tiene permiso para ver todas las ventas, verificar que sea suya
    if (!req.user.permissions?.includes(PERMISSIONS.VENTAS_VER_TODAS)) {
      if (venta.usuarioId !== req.user.id) {
        throw new BadRequestException('No tienes permisos para ver esta venta');
      }
    }

    return venta;
  }

  @Patch(':id')
  @RequirePermission(PERMISSIONS.VENTAS_EDITAR)
  @ApiOperation({ 
    summary: 'Actualizar venta',
    description: 'Actualiza los datos básicos de una venta (no los items)'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la venta' })
  @ApiResponse({ status: 200, description: 'Venta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  @ApiResponse({ status: 409, description: 'Conflicto con número de ticket' })
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVentaDto: UpdateTicketDto
  ) {
    return this.ventasService.update(id, updateVentaDto);
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.VENTAS_ELIMINAR)
  @ApiOperation({ 
    summary: 'Cancelar venta',
    description: 'Cancela una venta, devolviendo el stock de los productos y registrando los movimientos'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la venta' })
  @ApiResponse({ status: 200, description: 'Venta cancelada exitosamente' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async cancelar(@Param('id', ParseIntPipe) id: number) {
    await this.ventasService.remove(id);
    return { message: 'Venta cancelada exitosamente' };
  }

  @Post(':id/recalcular')
  @RequirePermission(PERMISSIONS.VENTAS_EDITAR)
  @ApiOperation({ 
    summary: 'Recalcular totales de venta',
    description: 'Recalcula los totales de una venta basándose en sus items actuales'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la venta' })
  @ApiResponse({ status: 200, description: 'Totales recalculados exitosamente' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async recalcular(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.recalculateTicketTotals(id);
  }
}