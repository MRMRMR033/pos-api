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
import { RequirePermission } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';

@ApiTags('Proveedores')
@Controller('proveedor')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ProveedorController {
  constructor(private readonly proveedorService: ProveedorService) {}

  @RequirePermission(PERMISSIONS.PROVEEDORES_CREAR)
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo proveedor' })
  @ApiBody({ type: CreateProveedorDto })
  @ApiResponse({ status: 201, description: 'Proveedor creado', type: ProveedorEntity })
  async create(
    @Body() dto: CreateProveedorDto,
  ): Promise<ProveedorEntity> {
    console.log('\n🏢 [PROVEEDORES] POST /proveedor');
    console.log('📥 Body:', dto);
    
    try {
      const result = await this.proveedorService.create(dto);
      console.log('✅ Proveedor created successfully:', { id: result.id, nombre: result.nombre });
      return result;
    } catch (error) {
      console.log('❌ Proveedor creation failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.PROVEEDORES_VER)
  @Get()
  @ApiOperation({ summary: 'Listar todos los proveedores' })
  @ApiResponse({
    status: 200,
    description: 'Listado de proveedores',
    type: [ProveedorEntity],
  })
  async findAll(): Promise<ProveedorEntity[]> {
    console.log('\n🏢 [PROVEEDORES] GET /proveedor');
    
    try {
      const result = await this.proveedorService.findAll();
      console.log('✅ Proveedores retrieved successfully:', { count: result.length });
      return result;
    } catch (error) {
      console.log('❌ Proveedores retrieval failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.PROVEEDORES_VER)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un proveedor por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado', type: ProveedorEntity })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProveedorEntity> {
    console.log('\n🏢 [PROVEEDORES] GET /proveedor/:id');
    console.log('📥 Params:', { id });
    
    try {
      const result = await this.proveedorService.findOne(id);
      console.log('✅ Proveedor retrieved successfully:', { id: result.id, nombre: result.nombre });
      return result;
    } catch (error) {
      console.log('❌ Proveedor retrieval failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.PROVEEDORES_EDITAR)
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
    console.log('\n🏢 [PROVEEDORES] PATCH /proveedor/:id');
    console.log('📥 Params:', { id });
    console.log('📥 Body:', dto);
    
    try {
      const result = await this.proveedorService.update(id, dto);
      console.log('✅ Proveedor updated successfully:', { id: result.id, nombre: result.nombre });
      return result;
    } catch (error) {
      console.log('❌ Proveedor update failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.PROVEEDORES_ELIMINAR)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un proveedor por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del proveedor' })
  @ApiResponse({ status: 204, description: 'Proveedor eliminado' })
  @ApiResponse({ status: 404, description: 'Proveedor no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    console.log('\n🏢 [PROVEEDORES] DELETE /proveedor/:id');
    console.log('📥 Params:', { id });
    
    try {
      await this.proveedorService.remove(id);
      console.log('✅ Proveedor deleted successfully:', { id });
    } catch (error) {
      console.log('❌ Proveedor deletion failed:', error.message);
      throw error;
    }
  }
}
