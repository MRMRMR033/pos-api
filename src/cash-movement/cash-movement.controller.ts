import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CashMovementService } from './cash-movement.service';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';
import { UpdateCashMovementDto } from './dto/update-cash-movement.dto';
import { RequirePermission } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';

@Controller('cash-movement')
export class CashMovementController {
  constructor(private readonly cashMovementService: CashMovementService) {}

  @RequirePermission(PERMISSIONS.CAJA_REGISTRAR_ENTRADA, PERMISSIONS.CAJA_REGISTRAR_SALIDA)
  @Post()
  create(@Body() createCashMovementDto: CreateCashMovementDto) {
    return this.cashMovementService.create(createCashMovementDto);
  }

  @RequirePermission(PERMISSIONS.CAJA_VER_MOVIMIENTOS_TODOS, PERMISSIONS.CAJA_VER_MOVIMIENTOS)
  @Get()
  findAll() {
    return this.cashMovementService.findAll();
  }

  @RequirePermission(PERMISSIONS.CAJA_VER_MOVIMIENTOS_TODOS, PERMISSIONS.CAJA_VER_MOVIMIENTOS)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cashMovementService.findOne(+id);
  }

  @RequirePermission(PERMISSIONS.CAJA_VER_MOVIMIENTOS_TODOS)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCashMovementDto: UpdateCashMovementDto) {
    return this.cashMovementService.update(+id, updateCashMovementDto);
  }

  @RequirePermission(PERMISSIONS.CAJA_VER_MOVIMIENTOS_TODOS)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cashMovementService.remove(+id);
  }
}
