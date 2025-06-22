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
  BadRequestException 
} from '@nestjs/common';
import { CompraService } from './compra.service';
import { CreateOrdenCompraDto } from './dto/create-orden-compra.dto';
import { UpdateOrdenCompraDto } from './dto/update-orden-compra.dto';
import { RecibirCompraDto } from './dto/recibir-compra.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { PERMISSIONS } from '../auth/permissions.constants';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EstadoOrden } from '../../generated/prisma';

@ApiTags('Compras')
@ApiBearerAuth()
@Controller('compra')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CompraController {
  constructor(private readonly compraService: CompraService) {}

  @Post()
  @RequirePermission(PERMISSIONS.COMPRAS_CREATE)
  @ApiOperation({ summary: 'Crear nueva orden de compra' })
  @ApiResponse({ status: 201, description: 'Orden de compra creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body() createOrdenCompraDto: CreateOrdenCompraDto, @Req() req: any) {
    console.log('\n📦 [COMPRAS] POST /compra');
    console.log('📥 Request body:', createOrdenCompraDto);
    console.log('📥 User ID:', req.user?.id);
    
    try {
      const result = this.compraService.create(createOrdenCompraDto, req.user.id);
      console.log('📤 Response: Purchase order created successfully');
      console.log('✅ Purchase order creation completed');
      return result;
    } catch (error) {
      console.log('❌ Purchase order creation failed:', error.message);
      throw error;
    }
  }

  @Get()
  @RequirePermission(PERMISSIONS.COMPRAS_READ)
  @ApiOperation({ summary: 'Obtener todas las órdenes de compra' })
  @ApiQuery({ name: 'page', required: false, description: 'Página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite por página (default: 10)' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoOrden, description: 'Filtrar por estado' })
  @ApiResponse({ status: 200, description: 'Lista de órdenes de compra' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('estado') estado?: EstadoOrden,
  ) {
    console.log('\n📦 [COMPRAS] GET /compra');
    console.log('📥 Query params:', { page, limit, estado });
    
    try {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      
      if (pageNum < 1 || limitNum < 1) {
        throw new BadRequestException('Page y limit deben ser números positivos');
      }
      
      const result = this.compraService.findAll(pageNum, limitNum, estado);
      console.log('📤 Response: Purchase orders list retrieved successfully');
      console.log('✅ Purchase orders list retrieval completed');
      return result;
    } catch (error) {
      console.log('❌ Purchase orders list retrieval failed:', error.message);
      throw error;
    }
  }

  @Get('proveedor/:proveedorId')
  @RequirePermission(PERMISSIONS.COMPRAS_READ)
  @ApiOperation({ summary: 'Obtener órdenes de compra por proveedor' })
  @ApiQuery({ name: 'page', required: false, description: 'Página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite por página (default: 10)' })
  @ApiResponse({ status: 200, description: 'Lista de órdenes de compra del proveedor' })
  findByProveedor(
    @Param('proveedorId', ParseIntPipe) proveedorId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    console.log('\n📦 [COMPRAS] GET /compra/proveedor/:proveedorId');
    console.log('📥 Params:', { proveedorId });
    console.log('📥 Query params:', { page, limit });
    
    try {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      
      if (pageNum < 1 || limitNum < 1) {
        throw new BadRequestException('Page y limit deben ser números positivos');
      }
      
      const result = this.compraService.findByProveedor(proveedorId, pageNum, limitNum);
      console.log('📤 Response: Purchase orders by supplier retrieved successfully');
      console.log('✅ Purchase orders by supplier retrieval completed');
      return result;
    } catch (error) {
      console.log('❌ Purchase orders by supplier retrieval failed:', error.message);
      throw error;
    }
  }

  @Get(':id')
  @RequirePermission(PERMISSIONS.COMPRAS_READ)
  @ApiOperation({ summary: 'Obtener orden de compra por ID' })
  @ApiResponse({ status: 200, description: 'Orden de compra encontrada' })
  @ApiResponse({ status: 404, description: 'Orden de compra no encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    console.log('\n📦 [COMPRAS] GET /compra/:id');
    console.log('📥 Params:', { id });
    
    try {
      const result = this.compraService.findOne(id);
      console.log('📤 Response: Purchase order retrieved successfully');
      console.log('✅ Purchase order retrieval completed');
      return result;
    } catch (error) {
      console.log('❌ Purchase order retrieval failed:', error.message);
      throw error;
    }
  }

  @Patch(':id')
  @RequirePermission(PERMISSIONS.COMPRAS_UPDATE)
  @ApiOperation({ summary: 'Actualizar orden de compra' })
  @ApiResponse({ status: 200, description: 'Orden de compra actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o orden no editable' })
  @ApiResponse({ status: 404, description: 'Orden de compra no encontrada' })
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateOrdenCompraDto: UpdateOrdenCompraDto
  ) {
    console.log('\n📦 [COMPRAS] PATCH /compra/:id');
    console.log('📥 Params:', { id });
    console.log('📥 Request body:', updateOrdenCompraDto);
    
    try {
      const result = this.compraService.update(id, updateOrdenCompraDto);
      console.log('📤 Response: Purchase order updated successfully');
      console.log('✅ Purchase order update completed');
      return result;
    } catch (error) {
      console.log('❌ Purchase order update failed:', error.message);
      throw error;
    }
  }

  @Delete(':id')
  @RequirePermission(PERMISSIONS.COMPRAS_DELETE)
  @ApiOperation({ summary: 'Eliminar orden de compra' })
  @ApiResponse({ status: 200, description: 'Orden de compra eliminada exitosamente' })
  @ApiResponse({ status: 400, description: 'Orden no eliminable' })
  @ApiResponse({ status: 404, description: 'Orden de compra no encontrada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    console.log('\n📦 [COMPRAS] DELETE /compra/:id');
    console.log('📥 Params:', { id });
    
    try {
      const result = this.compraService.remove(id);
      console.log('📤 Response: Purchase order deleted successfully');
      console.log('✅ Purchase order deletion completed');
      return result;
    } catch (error) {
      console.log('❌ Purchase order deletion failed:', error.message);
      throw error;
    }
  }

  @Post(':id/recibir')
  @RequirePermission(PERMISSIONS.COMPRAS_RECEIVE)
  @ApiOperation({ summary: 'Marcar orden de compra como recibida y actualizar inventario' })
  @ApiResponse({ status: 200, description: 'Orden recibida exitosamente, inventario actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o orden no recibible' })
  @ApiResponse({ status: 404, description: 'Orden de compra no encontrada' })
  recibir(
    @Param('id', ParseIntPipe) id: number,
    @Body() recibirCompraDto: RecibirCompraDto,
    @Req() req: any,
  ) {
    console.log('\n📦 [COMPRAS] POST /compra/:id/recibir');
    console.log('📥 Params:', { id });
    console.log('📥 Request body:', recibirCompraDto);
    console.log('📥 User ID:', req.user?.id);
    
    try {
      const result = this.compraService.recibir(id, recibirCompraDto, req.user.id);
      console.log('📤 Response: Purchase order received successfully');
      console.log('✅ Purchase order reception completed');
      return result;
    } catch (error) {
      console.log('❌ Purchase order reception failed:', error.message);
      throw error;
    }
  }
}