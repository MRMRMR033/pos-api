import { PartialType } from '@nestjs/swagger';
import { CreateSessionEventDto } from './create-session-event.dto';

export class UpdateSessionEventDto extends PartialType(CreateSessionEventDto) {}
