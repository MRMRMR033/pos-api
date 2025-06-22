import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UsePipes, ValidationPipe, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiNotFoundResponse, ApiForbiddenResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { CashMovementService } from './cash-movement.service';
import { CreateCashMovementDto } from './dto/create-cash-movement.dto';
import { UpdateCashMovementDto } from './dto/update-cash-movement.dto';
import { RequirePermission } from 'src/auth/permissions.decorator';
import { PERMISSIONS } from 'src/auth/permissions.constants';
import { ErrorResponseDto } from 'src/common/dto/api-response.dto';

@ApiTags('Movimientos de Caja')
@Controller('cash-movement')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class CashMovementController {
  constructor(private readonly cashMovementService: CashMovementService) {}

  @RequirePermission(PERMISSIONS.CAJA_REGISTRAR_ENTRADA, PERMISSIONS.CAJA_REGISTRAR_SALIDA)
  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Registrar movimiento de caja',
    description: `
      Registra un nuevo movimiento de caja (entrada o salida).
      
      **Permisos requeridos (al menos uno):**
      - caja:registrar_entrada (para entradas)
      - caja:registrar_salida (para salidas)
    `
  })
  @ApiBody({ 
    type: CreateCashMovementDto,
    examples: {
      entrada: {
        summary: 'Entrada de dinero',
        value: {
          tipo: 'entrada',
          monto: 500.00,
          descripcion: 'Venta al contado',
          usuarioId: 1
        }
      },
      salida: {
        summary: 'Salida de dinero',
        value: {
          tipo: 'salida',
          monto: 50.00,
          descripcion: 'Compra de suministros',
          usuarioId: 1
        }
      }
    }
  })
  @ApiCreatedResponse({ description: 'Movimiento registrado exitosamente' })
  @ApiBadRequestResponse({ description: 'Datos inválidos', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Sin permisos para registrar movimientos', type: ErrorResponseDto })
  create(@Body() createCashMovementDto: CreateCashMovementDto) {
    console.log('\n💵 [CASH-MOVEMENT] POST /cash-movement');
    console.log('📥 Body:', createCashMovementDto);
    
    try {
      const result = this.cashMovementService.create(createCashMovementDto);
      console.log('✅ Cash movement created successfully:', { tipo: createCashMovementDto.tipo, monto: createCashMovementDto.monto });
      return result;
    } catch (error) {
      console.log('❌ Cash movement creation failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.CAJA_VER_MOVIMIENTOS_TODOS, PERMISSIONS.CAJA_VER_MOVIMIENTOS)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Listar movimientos de caja',
    description: 'Obtiene todos los movimientos de caja según permisos del usuario.'
  })
  @ApiOkResponse({ description: 'Lista de movimientos obtenida exitosamente' })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Sin permisos para ver movimientos', type: ErrorResponseDto })
  findAll() {
    console.log('\n💵 [CASH-MOVEMENT] GET /cash-movement');
    
    try {
      const result = this.cashMovementService.findAll();
      console.log('✅ Cash movements retrieved successfully');
      return result;
    } catch (error) {
      console.log('❌ Cash movements retrieval failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.CAJA_VER_MOVIMIENTOS_TODOS, PERMISSIONS.CAJA_VER_MOVIMIENTOS)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener movimiento por ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del movimiento' })
  @ApiOkResponse({ description: 'Movimiento encontrado' })
  @ApiNotFoundResponse({ description: 'Movimiento no encontrado', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Sin permisos para ver movimientos', type: ErrorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number) {
    console.log('\n💵 [CASH-MOVEMENT] GET /cash-movement/:id');
    console.log('📥 Params:', { id });
    
    try {
      const result = this.cashMovementService.findOne(id);
      console.log('✅ Cash movement retrieved successfully:', { id });
      return result;
    } catch (error) {
      console.log('❌ Cash movement retrieval failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.CAJA_VER_MOVIMIENTOS_TODOS)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Actualizar movimiento de caja',
    description: 'Actualiza un movimiento existente. Solo administradores con permisos totales.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del movimiento' })
  @ApiBody({ type: UpdateCashMovementDto })
  @ApiOkResponse({ description: 'Movimiento actualizado exitosamente' })
  @ApiNotFoundResponse({ description: 'Movimiento no encontrado', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Sin permisos para editar movimientos', type: ErrorResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCashMovementDto: UpdateCashMovementDto) {
    console.log('\n💵 [CASH-MOVEMENT] PATCH /cash-movement/:id');
    console.log('📥 Params:', { id });
    console.log('📥 Body:', updateCashMovementDto);
    
    try {
      const result = this.cashMovementService.update(id, updateCashMovementDto);
      console.log('✅ Cash movement updated successfully:', { id });
      return result;
    } catch (error) {
      console.log('❌ Cash movement update failed:', error.message);
      throw error;
    }
  }

  @RequirePermission(PERMISSIONS.CAJA_VER_MOVIMIENTOS_TODOS)
  @Delete(':id')
  @HttpCode(204)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Eliminar movimiento de caja',
    description: 'Elimina un movimiento de caja. Solo administradores con permisos totales.'
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del movimiento' })
  @ApiResponse({ status: 204, description: 'Movimiento eliminado exitosamente' })
  @ApiNotFoundResponse({ description: 'Movimiento no encontrado', type: ErrorResponseDto })
  @ApiUnauthorizedResponse({ description: 'Token JWT requerido', type: ErrorResponseDto })
  @ApiForbiddenResponse({ description: 'Sin permisos para eliminar movimientos', type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    console.log('\n💵 [CASH-MOVEMENT] DELETE /cash-movement/:id');
    console.log('📥 Params:', { id });
    
    try {
      const result = this.cashMovementService.remove(id);
      console.log('✅ Cash movement deleted successfully:', { id });
      return result;
    } catch (error) {
      console.log('❌ Cash movement deletion failed:', error.message);
      throw error;
    }
  }
}
