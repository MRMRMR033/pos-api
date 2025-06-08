// src/session-event/session-event.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSessionEventDto } from './dto/create-session-event.dto';
import { UpdateSessionEventDto } from './dto/update-session-event.dto';
import { SessionEvent } from '../../generated/prisma';

@Injectable()
export class SessionEventService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registra un evento de sesión (login/logout).
   * @throws BadRequestException si hay un error en la creación.
   */
  async create(dto: CreateSessionEventDto): Promise<SessionEvent> {
    try {
      return await this.prisma.sessionEvent.create({
        data: {
          usuarioId: dto.usuarioId,
          tipo: dto.tipo,
          ...(dto.timestamp && { timestamp: new Date(dto.timestamp) }),
        },
      });
    } catch (e: any) {
      throw new BadRequestException('No se pudo registrar el evento de sesión');
    }
  }

  /**
   * Lista todos los eventos de sesión, en orden descendente por timestamp.
   */
  async findAll(): Promise<SessionEvent[]> {
    return this.prisma.sessionEvent.findMany({
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Obtiene un evento de sesión por su ID.
   * @throws NotFoundException si no existe.
   */
  async findOne(id: number): Promise<SessionEvent> {
    const event = await this.prisma.sessionEvent.findUnique({
      where: { id },
    });
    if (!event) {
      throw new NotFoundException(`Evento de sesión con ID ${id} no encontrado`);
    }
    return event;
  }

  /**
   * Actualiza un evento de sesión existente.
   * @throws NotFoundException si no existe.
   * @throws BadRequestException si la actualización falla.
   */
  async update(
    id: number,
    dto: UpdateSessionEventDto,
  ): Promise<SessionEvent> {
    await this.findOne(id);

    const data: any = {
      ...(dto.usuarioId !== undefined && { usuarioId: dto.usuarioId }),
      ...(dto.tipo !== undefined && { tipo: dto.tipo }),
      ...(dto.timestamp && { timestamp: new Date(dto.timestamp) }),
    };

    try {
      return await this.prisma.sessionEvent.update({
        where: { id },
        data,
      });
    } catch (e: any) {
      throw new BadRequestException('No se pudo actualizar el evento de sesión');
    }
  }

  /**
   * Elimina un evento de sesión.
   * @throws NotFoundException si no existe.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.sessionEvent.delete({ where: { id } });
  }
}
