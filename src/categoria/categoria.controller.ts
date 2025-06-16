import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { RequirePermission } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';

@Controller('categoria')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @RequirePermission(PERMISSIONS.CATEGORIAS_CREAR)
  @Post()
  create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriaService.create(createCategoriaDto);
  }

  @RequirePermission(PERMISSIONS.CATEGORIAS_VER)
  @Get()
  findAll() {
    return this.categoriaService.findAll();
  }

  @RequirePermission(PERMISSIONS.CATEGORIAS_VER)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriaService.findOne(+id);
  }

  @RequirePermission(PERMISSIONS.CATEGORIAS_EDITAR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    return this.categoriaService.update(+id, updateCategoriaDto);
  }

  @RequirePermission(PERMISSIONS.CATEGORIAS_ELIMINAR)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriaService.remove(+id);
  }
}
