// src/ticket-item/ticket-item.controller.ts

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
  import { TicketItemService } from './ticket-item.service';
  import { CreateTicketItemDto } from './dto/create-ticket-item.dto';
  import { UpdateTicketItemDto } from './dto/update-ticket-item.dto';
  import { TicketItemEntity } from './entity/ticket-item.entity';
  import { TicketItem } from '../../generated/prisma';
  import { Decimal } from '../../generated/prisma/runtime/library';
  import { RequirePermission } from 'src/auth/permissions.decorator';
  import { PERMISSIONS } from 'src/auth/permissions.constants';
  
  @ApiTags('Ticket Items')
  @Controller('ticket-item')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  export class TicketItemController {
    constructor(private readonly service: TicketItemService) {}
  
    /** Convierte un TicketItem de Prisma (con Decimal) a TicketItemEntity (con number). */
    private mapItem(item: TicketItem): TicketItemEntity {
      return {
        id: item.id,
        ticketId: item.ticketId,
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: (item.precioUnitario as Decimal).toNumber(),
        total: (item.total as Decimal).toNumber(),
      };
    }
  
    @RequirePermission(PERMISSIONS.VENTAS_CREAR)
    @Post()
    @ApiOperation({ summary: 'Crear un ítem de ticket' })
    @ApiBody({ type: CreateTicketItemDto })
    @ApiResponse({ status: 201, type: TicketItemEntity })
    async create(@Body() dto: CreateTicketItemDto): Promise<TicketItemEntity> {
      const created = await this.service.create(dto);
      return this.mapItem(created);
    }
  
    @RequirePermission(PERMISSIONS.VENTAS_VER_TODAS, PERMISSIONS.VENTAS_VER_PROPIAS)
    @Get()
    @ApiOperation({ summary: 'Listar todos los ítems de ticket' })
    @ApiResponse({ status: 200, type: [TicketItemEntity] })
    async findAll(): Promise<TicketItemEntity[]> {
      const items = await this.service.findAll();
      return items.map(i => this.mapItem(i));
    }
  
    @RequirePermission(PERMISSIONS.VENTAS_VER_TODAS, PERMISSIONS.VENTAS_VER_PROPIAS)
    @Get(':id')
    @ApiOperation({ summary: 'Obtener un ítem de ticket por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, type: TicketItemEntity })
    @ApiResponse({ status: 404, description: 'No encontrado' })
    async findOne(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<TicketItemEntity> {
      const item = await this.service.findOne(id);
      return this.mapItem(item);
    }
  
    @RequirePermission(PERMISSIONS.VENTAS_EDITAR)
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un ítem de ticket' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateTicketItemDto })
    @ApiResponse({ status: 200, type: TicketItemEntity })
    @ApiResponse({ status: 404, description: 'No encontrado' })
    async update(
      @Param('id', ParseIntPipe) id: number,
      @Body() dto: UpdateTicketItemDto,
    ): Promise<TicketItemEntity> {
      const updated = await this.service.update(id, dto);
      return this.mapItem(updated);
    }
  
    @RequirePermission(PERMISSIONS.VENTAS_ELIMINAR)
    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Eliminar un ítem de ticket' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 204 })
    @ApiResponse({ status: 404, description: 'No encontrado' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
      await this.service.remove(id);
    }
  }
  