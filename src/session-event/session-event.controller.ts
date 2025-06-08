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

@ApiTags('Session Events')
@Controller('session-event')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class SessionEventController {
  constructor(private readonly service: SessionEventService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar evento de sesión (login/logout)' })
  @ApiBody({ type: CreateSessionEventDto })
  @ApiResponse({ status: 201, type: SessionEvent })
  async create(@Body() dto: CreateSessionEventDto): Promise<SessionEvent> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los eventos de sesión' })
  @ApiResponse({ status: 200, type: [SessionEvent] })
  async findAll(): Promise<SessionEvent[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un evento por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: SessionEvent })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SessionEvent> {
    return this.service.findOne(id);
  }

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
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un evento de sesión' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Evento eliminado' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.service.remove(id);
  }
}
