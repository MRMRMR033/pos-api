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
    console.log('\n👤 [USUARIOS] POST /usuario');
    console.log('📥 Body:', { 
      email: dto.email, 
      fullName: dto.fullName, 
      rol: dto.rol,
      password: dto.password ? '[HIDDEN]' : undefined 
    });
    
    try {
      const result = await this.usuarioService.create(dto);
      console.log('✅ Usuario created successfully:', { id: result.id, email: result.email });
      return result;
    } catch (error) {
      console.log('❌ Usuario creation failed:', error.message);
      throw error;
    }
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
    console.log('\n👤 [USUARIOS] GET /usuario');
    
    try {
      const result = await this.usuarioService.findAll();
      console.log('✅ Usuarios retrieved successfully:', { count: result.length });
      return result;
    } catch (error) {
      console.log('❌ Usuarios retrieval failed:', error.message);
      throw error;
    }
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
    console.log('\n👤 [USUARIOS] GET /usuario/:id');
    console.log('📥 Params:', { id });
    
    try {
      const result = await this.usuarioService.findOne(id);
      console.log('✅ Usuario retrieved successfully:', { id: result.id, email: result.email });
      return result;
    } catch (error) {
      console.log('❌ Usuario retrieval failed:', error.message);
      throw error;
    }
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
    console.log('\n👤 [USUARIOS] PATCH /usuario/:id');
    console.log('📥 Params:', { id });
    console.log('📥 Body:', { 
      email: dto.email, 
      fullName: dto.fullName, 
      rol: dto.rol,
      password: dto.password ? '[HIDDEN]' : undefined 
    });
    
    try {
      const result = await this.usuarioService.update(id, dto);
      console.log('✅ Usuario updated successfully:', { id: result.id, email: result.email });
      return result;
    } catch (error) {
      console.log('❌ Usuario update failed:', error.message);
      throw error;
    }
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
    console.log('\n👤 [USUARIOS] DELETE /usuario/:id');
    console.log('📥 Params:', { id });
    
    try {
      await this.usuarioService.remove(id);
      console.log('✅ Usuario deleted successfully:', { id });
    } catch (error) {
      console.log('❌ Usuario deletion failed:', error.message);
      throw error;
    }
  }
}
