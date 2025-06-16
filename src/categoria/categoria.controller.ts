import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UsePipes, ValidationPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiForbiddenResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { RequirePermission } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { ErrorResponseDto } from 'src/common/dto/api-response.dto';

@ApiTags('Categorías')
@Controller('categoria')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @RequirePermission(PERMISSIONS.CATEGORIAS_CREAR)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Crear nueva categoría',
    description: 'Crea una nueva categoría de productos en el sistema. Requiere permiso categorias:crear.'
  })
  @ApiBody({ type: CreateCategoriaDto })
  @ApiCreatedResponse({ description: 'Categoría creada exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Sin permisos para crear categorías', type: ErrorResponseDto })
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriaService.create(createCategoriaDto);
  }

  @RequirePermission(PERMISSIONS.CATEGORIAS_VER)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar todas las categorías' })
  @ApiOkResponse({ description: 'Lista de categorías obtenida exitosamente' })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Sin permisos para ver categorías', type: ErrorResponseDto })
  findAll() {
    return this.categoriaService.findAll();
  }

  @RequirePermission(PERMISSIONS.CATEGORIAS_VER)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la categoría' })
  @ApiOkResponse({ description: 'Categoría encontrada' })
  @ApiNotFoundResponse({ description: 'Categoría no encontrada', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Sin permisos para ver categorías', type: ErrorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriaService.findOne(id);
  }

  @RequirePermission(PERMISSIONS.CATEGORIAS_EDITAR)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar categoría por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la categoría' })
  @ApiBody({ type: UpdateCategoriaDto })
  @ApiOkResponse({ description: 'Categoría actualizada exitosamente' })
  @ApiNotFoundResponse({ description: 'Categoría no encontrada', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Sin permisos para editar categorías', type: ErrorResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    return this.categoriaService.update(id, updateCategoriaDto);
  }

  @RequirePermission(PERMISSIONS.CATEGORIAS_ELIMINAR)
  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar categoría por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID de la categoría' })
  @ApiResponse({ status: 204, description: 'Categoría eliminada exitosamente' })
  @ApiNotFoundResponse({ description: 'Categoría no encontrada', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Sin permisos para eliminar categorías', type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.categoriaService.remove(id);
  }
}
