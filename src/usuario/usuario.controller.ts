// src/usuario/usuario.controller.ts
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
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario as UsuarioEntity } from './entities/usuario.entity';
import { Public } from 'src/auth/public.decorator';
import { RequirePermission } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';

@ApiTags('Usuarios')
@Controller('usuario')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @RequirePermission(PERMISSIONS.USUARIOS_CREAR)
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiBody({ type: CreateUsuarioDto })
  @ApiResponse({ status: 201, description: 'Usuario creado', type: UsuarioEntity })
  async create(
    @Body() dto: CreateUsuarioDto,
  ): Promise<Omit<UsuarioEntity, 'password'>> {
    return this.usuarioService.create(dto);
  }

  @RequirePermission(PERMISSIONS.USUARIOS_VER_TODOS)
  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Listado de usuarios',
    type: [UsuarioEntity],
  })
  async findAll(): Promise<Omit<UsuarioEntity, 'password'>[]> {
    return this.usuarioService.findAll();
  }

  @RequirePermission(PERMISSIONS.USUARIOS_VER_TODOS, PERMISSIONS.USUARIOS_VER_PROPIO)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UsuarioEntity })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Omit<UsuarioEntity, 'password'>> {
    return this.usuarioService.findOne(id);
  }

  @RequirePermission(PERMISSIONS.USUARIOS_EDITAR)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiBody({ type: UpdateUsuarioDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: UsuarioEntity })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<Omit<UsuarioEntity, 'password'>> {
    return this.usuarioService.update(id, dto);
  }

  @RequirePermission(PERMISSIONS.USUARIOS_ELIMINAR)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un usuario por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.usuarioService.remove(id);
  }
}
