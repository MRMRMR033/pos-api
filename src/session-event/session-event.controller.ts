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
import { SessionEventService } from './session-event.service';
import { CreateSessionEventDto } from './dto/create-session-event.dto';
import { UpdateSessionEventDto } from './dto/update-session-event.dto';
import { SessionEvent } from './entities/session-event.entity';
import { RequirePermission } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';

@ApiTags('Session Events')
@Controller('session-event')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class SessionEventController {
  constructor(private readonly service: SessionEventService) {}

  @RequirePermission(PERMISSIONS.SESIONES_VER_PROPIAS)
  @Post()
  @ApiOperation({ summary: 'Registrar evento de sesión (login/logout)' })
  @ApiBody({ type: CreateSessionEventDto })
  @ApiResponse({ status: 201, type: SessionEvent })
  async create(@Body() dto: CreateSessionEventDto): Promise<SessionEvent> {
    console.log('\n📝 [SESSION-EVENT] POST /session-event');
    console.log('📥 Body:', dto);
    
    try {
      const result = await this.service.create(dto);
      console.log('✅ Session event created successfully:', { id: result.id, tipo: result.tipo });
      return result;
    } catch (error) {
      console.log('❌ Session event creation failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.SESIONES_VER_TODAS, PERMISSIONS.SESIONES_VER_PROPIAS)
  @Get()
  @ApiOperation({ summary: 'Obtener todos los eventos de sesión' })
  @ApiResponse({ status: 200, type: [SessionEvent] })
  async findAll(): Promise<SessionEvent[]> {
    console.log('\n📝 [SESSION-EVENT] GET /session-event');
    
    try {
      const result = await this.service.findAll();
      console.log('✅ Session events retrieved successfully:', { count: result.length });
      return result;
    } catch (error) {
      console.log('❌ Session events retrieval failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.SESIONES_VER_TODAS, PERMISSIONS.SESIONES_VER_PROPIAS)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un evento por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: SessionEvent })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SessionEvent> {
    console.log('\n📝 [SESSION-EVENT] GET /session-event/:id');
    console.log('📥 Params:', { id });
    
    try {
      const result = await this.service.findOne(id);
      console.log('✅ Session event retrieved successfully:', { id: result.id, tipo: result.tipo });
      return result;
    } catch (error) {
      console.log('❌ Session event retrieval failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.SESIONES_VER_TODAS)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un evento de sesión' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateSessionEventDto })
  @ApiResponse({ status: 200, type: SessionEvent })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSessionEventDto,
  ): Promise<SessionEvent> {
    console.log('\n📝 [SESSION-EVENT] PATCH /session-event/:id');
    console.log('📥 Params:', { id });
    console.log('📥 Body:', dto);
    
    try {
      const result = await this.service.update(id, dto);
      console.log('✅ Session event updated successfully:', { id: result.id, tipo: result.tipo });
      return result;
    } catch (error) {
      console.log('❌ Session event update failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.SESIONES_VER_TODAS)
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un evento de sesión' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Evento eliminado' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    console.log('\n📝 [SESSION-EVENT] DELETE /session-event/:id');
    console.log('📥 Params:', { id });
    
    try {
      await this.service.remove(id);
      console.log('✅ Session event deleted successfully:', { id });
    } catch (error) {
      console.log('❌ Session event deletion failed:', error.message);
      throw error;
    }
  }
}
