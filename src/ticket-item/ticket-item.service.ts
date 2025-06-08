import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketItemDto } from './dto/create-ticket-item.dto';
import { UpdateTicketItemDto } from './dto/update-ticket-item.dto';
import { TicketItem } from '../../generated/prisma';

@Injectable()
export class TicketItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketItemDto): Promise<TicketItem> {
    // calcula total en base a cantidad y precioUnitario
    const total = dto.cantidad * dto.precioUnitario;
    return this.prisma.ticketItem.create({
      data: { ...dto, total },
    });
  }

  async findAll(): Promise<TicketItem[]> {
    return this.prisma.ticketItem.findMany();
  }

  async findOne(id: number): Promise<TicketItem> {
    const item = await this.prisma.ticketItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`TicketItem ${id} no existe`);
    return item;
  }

  async update(id: number, dto: UpdateTicketItemDto): Promise<TicketItem> {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.cantidad !== undefined || dto.precioUnitario !== undefined) {
      // Recalcula total si cambiaron cantidad o precio
      const item = await this.prisma.ticketItem.findUnique({ where: { id } });
      const cantidad = dto.cantidad ?? item.cantidad;
      const precio = dto.precioUnitario ?? item.precioUnitario.toNumber();
      data.total = cantidad * precio;
    }
    return this.prisma.ticketItem.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.ticketItem.delete({ where: { id } });
  }
}
