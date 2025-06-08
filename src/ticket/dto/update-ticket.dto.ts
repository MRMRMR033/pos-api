import { PartialType } from '@nestjs/swagger';
import { CreateVentaDto } from './create-ticket.dto';

export class UpdateVentaDto extends PartialType(CreateVentaDto) {}
