import { PartialType } from '@nestjs/swagger';
import { CreateTicketItemDto } from './create-ticket-item.dto';

export class UpdateTicketItemDto extends PartialType(CreateTicketItemDto) {}
