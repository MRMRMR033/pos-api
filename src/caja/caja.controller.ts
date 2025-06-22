import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Req,
  ParseIntPipe,
  BadRequestException 
} from '@nestjs/common';
import { CajaService } from './caja.service';
import { AbrirCajaDto } from './dto/abrir-caja.dto';
import { CerrarCajaDto } from './dto/cerrar-caja.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermission } from '../auth/permissions.decorator';
import { PERMISSIONS } from '../auth/permissions.constants';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EstadoTurno } from '../../generated/prisma';

@ApiTags('Caja')
@ApiBearerAuth()
@Controller('caja')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Post('abrir')
  @RequirePermission(PERMISSIONS.CAJA_OPEN)
  @ApiOperation({ summary: 'Abrir turno de caja' })
  @ApiResponse({ status: 201, description: 'Turno de caja abierto exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya tienes un turno abierto o la caja está ocupada' })
  abrir(@Body() abrirCajaDto: AbrirCajaDto, @Req() req: any) {
    console.log('\n💰 [CAJA] POST /caja/abrir');
    console.log('📥 Request body:', abrirCajaDto);
    console.log('📥 User ID:', req.user?.id);
    
    try {
      const result = this.cajaService.abrir(abrirCajaDto, req.user.id);
      console.log('📤 Response: Cash register opened successfully');
      console.log('✅ Cash register opening completed');
      return result;
    } catch (error) {
      console.log('❌ Cash register opening failed:', error.message);
      throw error;
    }
  }

  @Post(':id/cerrar')
  @RequirePermission(PERMISSIONS.CAJA_CLOSE)
  @ApiOperation({ summary: 'Cerrar turno de caja' })
  @ApiResponse({ status: 200, description: 'Turno de caja cerrado exitosamente con arqueo completo' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o turno no cerrable' })
  @ApiResponse({ status: 404, description: 'Turno no encontrado' })
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cerrarCajaDto: CerrarCajaDto,
    @Req() req: any,
  ) {
    console.log('\n💰 [CAJA] POST /caja/:id/cerrar');
    console.log('📥 Params:', { id });
    console.log('📥 Request body:', cerrarCajaDto);
    console.log('📥 User ID:', req.user?.id);
    
    try {
      const result = this.cajaService.cerrar(id, cerrarCajaDto, req.user.id);
      console.log('📤 Response: Cash register closed successfully');
      console.log('✅ Cash register closing completed');
      return result;
    } catch (error) {
      console.log('❌ Cash register closing failed:', error.message);
      throw error;
    }
  }

  @Get('actual')
  @RequirePermission(PERMISSIONS.CAJA_READ)
  @ApiOperation({ summary: 'Obtener turno de caja actual del usuario' })
  @ApiResponse({ status: 200, description: 'Turno actual con resumen de movimientos' })
  @ApiResponse({ status: 404, description: 'No tienes un turno abierto' })
  getTurnoActual(@Req() req: any) {
    console.log('\n💰 [CAJA] GET /caja/actual');
    console.log('📥 User ID:', req.user?.id);
    
    try {
      const result = this.cajaService.getTurnoActual(req.user.id);
      console.log('📤 Response: Current shift retrieved successfully');
      console.log('✅ Current shift retrieval completed');
      return result;
    } catch (error) {
      console.log('❌ Current shift retrieval failed:', error.message);
      throw error;
    }
  }

  @Get('turnos')
  @RequirePermission(PERMISSIONS.CAJA_READ)
  @ApiOperation({ summary: 'Obtener historial de turnos de caja' })
  @ApiQuery({ name: 'page', required: false, description: 'Página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite por página (default: 10)' })
  @ApiQuery({ name: 'usuarioId', required: false, description: 'Filtrar por usuario' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoTurno, description: 'Filtrar por estado' })
  @ApiResponse({ status: 200, description: 'Lista de turnos de caja' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('estado') estado?: EstadoTurno,
  ) {
    console.log('\n💰 [CAJA] GET /caja/turnos');
    console.log('📥 Query params:', { page, limit, usuarioId, estado });
    
    try {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      const userIdNum = usuarioId ? parseInt(usuarioId) : undefined;
      
      if (pageNum < 1 || limitNum < 1) {
        throw new BadRequestException('Page y limit deben ser números positivos');
      }

      if (usuarioId && isNaN(userIdNum!)) {
        throw new BadRequestException('usuarioId debe ser un número válido');
      }
      
      const result = this.cajaService.findAll(pageNum, limitNum, userIdNum, estado);
      console.log('📤 Response: Shifts list retrieved successfully');
      console.log('✅ Shifts list retrieval completed');
      return result;
    } catch (error) {
      console.log('❌ Shifts list retrieval failed:', error.message);
      throw error;
    }
  }

  @Get('turnos/:id')
  @RequirePermission(PERMISSIONS.CAJA_READ)
  @ApiOperation({ summary: 'Obtener turno de caja por ID' })
  @ApiResponse({ status: 200, description: 'Turno encontrado con todas sus ventas' })
  @ApiResponse({ status: 404, description: 'Turno no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    console.log('\n💰 [CAJA] GET /caja/turnos/:id');
    console.log('📥 Params:', { id });
    
    try {
      const result = this.cajaService.findOne(id);
      console.log('📤 Response: Shift details retrieved successfully');
      console.log('✅ Shift details retrieval completed');
      return result;
    } catch (error) {
      console.log('❌ Shift details retrieval failed:', error.message);
      throw error;
    }
  }

  @Get('turnos/:id/movimientos')
  @RequirePermission(PERMISSIONS.CAJA_READ)
  @ApiOperation({ summary: 'Obtener movimientos de efectivo de un turno' })
  @ApiResponse({ status: 200, description: 'Movimientos de caja del turno' })
  @ApiResponse({ status: 404, description: 'Turno no encontrado' })
  getMovimientosCaja(@Param('id', ParseIntPipe) id: number) {
    console.log('\n💰 [CAJA] GET /caja/turnos/:id/movimientos');
    console.log('📥 Params:', { id });
    
    try {
      const result = this.cajaService.getMovimientosCaja(id);
      console.log('📤 Response: Cash movements retrieved successfully');
      console.log('✅ Cash movements retrieval completed');
      return result;
    } catch (error) {
      console.log('❌ Cash movements retrieval failed:', error.message);
      throw error;
    }
  }
}