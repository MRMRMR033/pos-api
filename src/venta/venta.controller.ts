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
import { VentaService } from './venta.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta as VentaEntity } from './entities/venta.entity';

@ApiTags('Ventas')
@Controller('venta')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class VentaController {
  constructor(private readonly ventaService: VentaService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una nueva venta' })
  @ApiBody({ type: CreateVentaDto })
  @ApiResponse({ status: 201, description: 'Venta creada', type: VentaEntity })
  async create(@Body() dto: CreateVentaDto): Promise<VentaEntity> {
    return this.ventaService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las ventas' })
  @ApiResponse({ status: 200, description: 'Listado de ventas', type: [VentaEntity] })
  async findAll(): Promise<VentaEntity[]> {
    return this.ventaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una venta por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la venta' })
  @ApiResponse({ status: 200, description: 'Venta encontrada', type: VentaEntity })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<VentaEntity> {
    return this.ventaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una venta por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la venta' })
  @ApiBody({ type: UpdateVentaDto })
  @ApiResponse({ status: 200, description: 'Venta actualizada', type: VentaEntity })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVentaDto,
  ): Promise<VentaEntity> {
    return this.ventaService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar una venta por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la venta' })
  @ApiResponse({ status: 204, description: 'Venta eliminada' })
  @ApiResponse({ status: 404, description: 'Venta no encontrada' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.ventaService.remove(id);
  }
}
