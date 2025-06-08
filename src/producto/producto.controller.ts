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
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductoEntity } from './entities/producto.entity';
import { Producto } from '../../generated/prisma'; // Prisma type
import { Decimal } from '../../generated/prisma/runtime/library'; // para tipar el decimal

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

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiBody({ type: CreateProductoDto })
  @ApiResponse({ status: 201, description: 'Producto creado con éxito', type: ProductoEntity })
  async create(@Body() dto: CreateProductoDto): Promise<ProductoEntity> {
    const creado = await this.productoService.create(dto);
    return this.mapProducto(creado);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({ status: 200, description: 'Listado de productos', type: [ProductoEntity] })
  async findAll(): Promise<ProductoEntity[]> {
    const list = await this.productoService.findAll();
    return list.map(p => this.mapProducto(p));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado', type: ProductoEntity })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProductoEntity> {
    const p = await this.productoService.findOne(id);
    return this.mapProducto(p);
  }

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
    const updated = await this.productoService.update(id, dto);
    return this.mapProducto(updated);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un producto por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del producto' })
  @ApiResponse({ status: 204, description: 'Producto eliminado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.productoService.remove(id);
  }
}
