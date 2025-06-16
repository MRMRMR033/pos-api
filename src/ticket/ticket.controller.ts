// src/venta/venta.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Venta as VentaEntity } from './entities/venta.entity';
import { RequirePermission } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';

@ApiTags('Ventas')
@Controller('venta')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class TicketController {
  constructor(private readonly ticketVenta: TicketService) {}

  @RequirePermission(PERMISSIONS.VENTAS_CREAR)
  @Post()
  @ApiOperation({ summary: 'Registrar una nueva venta' })
  @ApiBody({ type: CreateTicketDto })
  @ApiResponse({ status: 201, description: 'Venta creada', type: VentaEntity })
  async create(@Body() dto: CreateTicketDto): Promise<VentaEntity> {
    return this.ticketVenta.create(dto);
  }

  @RequirePermission(PERMISSIONS.VENTAS_VER_TODAS, PERMISSIONS.VENTAS_VER_PROPIAS)
  @Get()
  @ApiOperation({ summary: 'Listar todas las ventas' })
  @ApiResponse({ status: 200, description: 'Listado de ventas', type: [VentaEntity] })
  async findAll(): Promise<VentaEntity[]> {
    return this.ticketVenta.findAll();
  }

  @RequirePermission(PERMISSIONS.VENTAS_VER_TODAS, PERMISSIONS.VENTAS_VER_PROPIAS)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la venta' })
  @ApiResponse({ status: 200, description: 'Venta encontrada', type: VentaEntity })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<VentaEntity> {
    return this.ticketVenta.findOne(id);
  }

  @RequirePermission(PERMISSIONS.VENTAS_EDITAR)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una venta por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la venta' })
  @ApiBody({ type: UpdateTicketDto })
  @ApiResponse({ status: 200, description: 'Venta actualizada', type: VentaEntity })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketDto,
  ): Promise<VentaEntity> {
    return this.ticketVenta.update(id, dto);
  }

  @RequirePermission(PERMISSIONS.VENTAS_ELIMINAR)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar una venta por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la venta' })
  @ApiResponse({ status: 204, description: 'Venta eliminada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.ticketVenta.remove(id);
  }
}
