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
      console.log('\n🛍 [TICKET-ITEM] POST /ticket-item');
      console.log('📥 Body:', dto);
      
      try {
        const created = await this.service.create(dto);
        const result = this.mapItem(created);
        console.log('✅ Ticket item created successfully:', { id: result.id, ticketId: result.ticketId, productoId: result.productoId });
        return result;
      } catch (error) {
        console.log('❌ Ticket item creation failed:', error.message);
        throw error;
      }
    }
  
    @RequirePermission(PERMISSIONS.VENTAS_VER_TODAS, PERMISSIONS.VENTAS_VER_PROPIAS)
    @Get()
    @ApiOperation({ summary: 'Listar todos los ítems de ticket' })
    @ApiResponse({ status: 200, type: [TicketItemEntity] })
    async findAll(): Promise<TicketItemEntity[]> {
      console.log('\n🛍 [TICKET-ITEM] GET /ticket-item');
      
      try {
        const items = await this.service.findAll();
        const result = items.map(i => this.mapItem(i));
        console.log('✅ Ticket items retrieved successfully:', { count: result.length });
        return result;
      } catch (error) {
        console.log('❌ Ticket items retrieval failed:', error.message);
        throw error;
      }
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
      console.log('\n🛍 [TICKET-ITEM] GET /ticket-item/:id');
      console.log('📥 Params:', { id });
      
      try {
        const item = await this.service.findOne(id);
        const result = this.mapItem(item);
        console.log('✅ Ticket item retrieved successfully:', { id: result.id, ticketId: result.ticketId });
        return result;
      } catch (error) {
        console.log('❌ Ticket item retrieval failed:', error.message);
        throw error;
      }
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
      console.log('\n🛍 [TICKET-ITEM] PATCH /ticket-item/:id');
      console.log('📥 Params:', { id });
      console.log('📥 Body:', dto);
      
      try {
        const updated = await this.service.update(id, dto);
        const result = this.mapItem(updated);
        console.log('✅ Ticket item updated successfully:', { id: result.id, ticketId: result.ticketId });
        return result;
      } catch (error) {
        console.log('❌ Ticket item update failed:', error.message);
        throw error;
      }
    }
  
    @RequirePermission(PERMISSIONS.VENTAS_ELIMINAR)
    @Delete(':id')
    @HttpCode(204)
    @ApiOperation({ summary: 'Eliminar un ítem de ticket' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 204 })
    @ApiResponse({ status: 404, description: 'No encontrado' })
    async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
      console.log('\n🛍 [TICKET-ITEM] DELETE /ticket-item/:id');
      console.log('📥 Params:', { id });
      
      try {
        await this.service.remove(id);
        console.log('✅ Ticket item deleted successfully:', { id });
      } catch (error) {
        console.log('❌ Ticket item deletion failed:', error.message);
        throw error;
      }
    }
  }
  