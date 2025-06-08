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
import { ProveedorService } from './proveedor.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
// Entidad para Swagger (documentación)
import { ProveedorEntity } from './entities/proveedor.entity';

@ApiTags('Proveedores')
@Controller('proveedor')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiBody({ type: CreateProveedorDto })
  @ApiResponse({ status: 201, description: 'Proveedor creado', type: ProveedorEntity })
  async create(
    @Body() dto: CreateProveedorDto,
  ): Promise<ProveedorEntity> {
    return this.proveedorService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los proveedores' })
  @ApiResponse({
    status: 200,
    description: 'Listado de proveedores',
    type: [ProveedorEntity],
  })
  async findAll(): Promise<ProveedorEntity[]> {
    return this.proveedorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado', type: ProveedorEntity })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProveedorEntity> {
    return this.proveedorService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un proveedor por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del proveedor' })
  @ApiBody({ type: UpdateProveedorDto })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado', type: ProveedorEntity })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProveedorDto,
  ): Promise<ProveedorEntity> {
    return this.proveedorService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un proveedor por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del proveedor' })
  @ApiResponse({ status: 204, description: 'Proveedor eliminado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.proveedorService.remove(id);
  }
}
