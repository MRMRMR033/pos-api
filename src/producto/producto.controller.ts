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
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ProductoEntity } from './entities/producto.entity';
import { Producto } from '../../generated/prisma'; // Prisma type
import { Decimal } from '../../generated/prisma/runtime/library'; // para tipar el decimal
import { ProductoConRelaciones } from './producto.service';
import { RequirePermission } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { ErrorResponseDto } from 'src/common/dto/api-response.dto';

@ApiTags('Productos')
@Controller('producto')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  /** Mappea un Producto de Prisma (Decimal) a la entidad de salida (number). */
  private mapProducto(p: Producto & { categoria: { id: number; nombre: string }; proveedor: { id: number; nombre: string } }): ProductoEntity {
    return {
      id: p.id,
      codigoBarras: p.codigoBarras,
      nombre: p.nombre,
      precioCosto: (p.precioCosto as Decimal).toNumber(),
      precioVenta: (p.precioVenta as Decimal).toNumber(),
      precioEspecial: p.precioEspecial != null ? (p.precioEspecial as Decimal).toNumber() : undefined,
      stock: p.stock,
      categoriaId: p.categoriaId,
      proveedorId: p.proveedorId,
      categoria: p.categoria,
      proveedor: p.proveedor,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  @RequirePermission(PERMISSIONS.PRODUCTOS_CREAR)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Crear un nuevo producto',
    description: `
      Crea un nuevo producto en el inventario del sistema POS.
      
      **Permiso requerido:** productos:crear
      
      **Campos requeridos:**
      - Código de barras (único)
      - Nombre del producto
      - Precio de costo
      - Precio de venta
      - Categoría (ID)
    `
  })
  @ApiBody({ 
    type: CreateProductoDto,
    examples: {
      basico: {
        summary: 'Producto básico',
        value: {
          codigoBarras: '7894900011517',
          nombre: 'Coca Cola 350ml',
          precioCosto: 1.50,
          precioVenta: 2.50,
          categoriaId: 1,
          proveedorId: 1,
          stock: 100
        }
      },
      sinProveedor: {
        summary: 'Producto sin proveedor',
        value: {
          codigoBarras: '7894900011518',
          nombre: 'Agua Mineral 500ml',
          precioCosto: 0.80,
          precioVenta: 1.20,
          categoriaId: 1,
          stock: 50
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'Producto creado exitosamente', 
    type: ProductoEntity,
    example: {
      id: 15,
      codigoBarras: '7894900011517',
      nombre: 'Coca Cola 350ml',
      precioCosto: 1.50,
      precioVenta: 2.50,
      precioEspecial: null,
      stock: 100,
      categoriaId: 1,
      proveedorId: 1,
      categoria: { id: 1, nombre: 'Bebidas' },
      proveedor: { id: 1, nombre: 'Distribuidora ABC' },
      createdAt: '2025-06-16T10:30:00.000Z',
      updatedAt: '2025-06-16T10:30:00.000Z'
    }
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o código de barras duplicado',
    type: ErrorResponseDto,
    example: {
      statusCode: 400,
      message: ['El código de barras ya existe', 'El precio de venta debe ser mayor a cero'],
      error: 'Bad Request'
    }
  })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ 
    description: 'Sin permisos para crear productos', 
    type: ErrorResponseDto,
    example: {
      statusCode: 403,
      message: 'No tienes permisos suficientes. Permisos requeridos (al menos uno): productos:crear'
    }
  })
  async create(@Body() dto: CreateProductoDto): Promise<ProductoEntity> {
    console.log('\n📰 [PRODUCTOS] POST /producto');
    console.log('📥 Request body:', dto);
    
    try {
      const creado = await this.productoService.create(dto);
      const result = this.mapProducto(creado);
      console.log('📤 Response: Product created with ID', result.id, 'and name', result.nombre);
      console.log('✅ Product created successfully');
      return result;
    } catch (error) {
      console.log('❌ Product creation failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.PRODUCTOS_VER)
  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({ status: 200, description: 'Listado de productos', type: [ProductoEntity] })
  async findAll(): Promise<ProductoEntity[]> {
    console.log('\n📰 [PRODUCTOS] GET /producto');
    
    try {
      const list = await this.productoService.findAll();
      const result = list.map(p => this.mapProducto(p));
      console.log('📤 Response: Found', result.length, 'products');
      console.log('✅ Products list retrieved successfully');
      return result;
    } catch (error) {
      console.log('❌ Products list retrieval failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.PRODUCTOS_VER)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado', type: ProductoEntity })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductoEntity> {
    console.log('\n📰 [PRODUCTOS] GET /producto/:id');
    console.log('📥 Params:', { id });
    
    try {
      const p = await this.productoService.findOne(id);
      const result = this.mapProducto(p);
      console.log('📤 Response: Product', result.id, 'with name', result.nombre);
      console.log('✅ Product retrieved successfully');
      return result;
    } catch (error) {
      console.log('❌ Product retrieval failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.PRODUCTOS_EDITAR)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un producto por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del producto' })
  @ApiBody({ type: UpdateProductoDto })
  @ApiResponse({ status: 200, description: 'Producto actualizado', type: ProductoEntity })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductoDto,
  ): Promise<ProductoEntity> {
    console.log('\n📰 [PRODUCTOS] PATCH /producto/:id');
    console.log('📥 Params:', { id });
    console.log('📥 Request body:', dto);
    
    try {
      const updated = await this.productoService.update(id, dto);
      const result = this.mapProducto(updated);
      console.log('📤 Response: Product updated successfully');
      console.log('✅ Product update completed');
      return result;
    } catch (error) {
      console.log('❌ Product update failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.PRODUCTOS_AJUSTAR_STOCK)
  @Post(':id/adjust-stock')
  @ApiOperation({ 
    summary: 'Ajustar stock de un producto',
    description: 'Permite realizar ajustes de inventario: entradas, salidas o ajustes absolutos'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del producto' })
  @ApiBody({ type: AdjustStockDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Stock ajustado exitosamente',
    type: ProductoEntity
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos o stock insuficiente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustStockDto,
  ): Promise<ProductoEntity> {
    console.log('\n📰 [PRODUCTOS] POST /producto/:id/adjust-stock');
    console.log('📥 Params:', { id });
    console.log('📥 Request body:', dto);
    
    try {
      const updated = await this.productoService.adjustStock(id, dto);
      const result = this.mapProducto(updated);
      console.log('📤 Response: Stock adjusted successfully');
      console.log('✅ Stock adjustment completed');
      return result;
    } catch (error) {
      console.log('❌ Stock adjustment failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.PRODUCTOS_ELIMINAR)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un producto por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del producto' })
  @ApiResponse({ status: 204, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    console.log('\n📰 [PRODUCTOS] DELETE /producto/:id');
    console.log('📥 Params:', { id });
    
    try {
      await this.productoService.remove(id);
      console.log('📤 Response: Product deleted successfully');
      console.log('✅ Product deletion completed');
    } catch (error) {
      console.log('❌ Product deletion failed:', error.message);
      throw error;
    }
  }
}
