import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Res,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/rol.guard';
import { Rol } from '../auth/rol.decorator';
import { AdminService } from './admin.service';

@ApiTags('Administración')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Rol('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('health')
  @ApiOperation({ 
    summary: 'Health check del sistema',
    description: 'Verifica conexión a BD, migraciones y estado general'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sistema operativo',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string' },
        database: { type: 'object' },
        migrations: { type: 'object' },
        permissions: { type: 'object' }
      }
    }
  })
  async healthCheck() {
    console.log('\n⚙️ [ADMIN] GET /admin/health');
    
    try {
      const result = await this.adminService.performHealthCheck();
      console.log('✅ Health check completed successfully:', { status: result.status });
      return result;
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      throw error;
    }
  }

  @Get('logs')
  @ApiOperation({ 
    summary: 'Descargar logs del sistema',
    description: 'Descarga los últimos registros de la aplicación'
  })
  @ApiResponse({ status: 200, description: 'Archivo de logs' })
  async downloadLogs(@Res() res: Response) {
    console.log('\n⚙️ [ADMIN] GET /admin/logs');
    
    try {
      const logsPath = await this.adminService.getLogsFile();
      console.log('✅ Logs file download initiated:', { path: logsPath });
      res.download(logsPath, 'pos-system.log');
    } catch (error) {
      console.log('❌ Logs download failed:', error.message);
      res.status(HttpStatus.NOT_FOUND).json({
        message: 'Archivo de logs no encontrado',
        error: error.message
      });
    }
  }

  @Get('integrity-check')
  @ApiOperation({ 
    summary: 'Verificación de integridad',
    description: 'Verifica integridad del schema y relaciones críticas'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Reporte de integridad',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        checks: { type: 'array' },
        errors: { type: 'array' },
        summary: { type: 'object' }
      }
    }
  })
  async integrityCheck() {
    console.log('\n⚙️ [ADMIN] GET /admin/integrity-check');
    
    try {
      const result = await this.adminService.performIntegrityCheck();
      console.log('✅ Integrity check completed successfully:', { status: result.status, errorsCount: result.errors?.length || 0 });
      return result;
    } catch (error) {
      console.log('❌ Integrity check failed:', error.message);
      throw error;
    }
  }

  @Post('backup')
  @ApiOperation({ 
    summary: 'Crear backup de la base de datos',
    description: 'Genera un volcado completo de la base de datos'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Backup creado exitosamente',
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string' },
        size: { type: 'number' },
        timestamp: { type: 'string' },
        downloadUrl: { type: 'string' }
      }
    }
  })
  async createBackup() {
    console.log('\n⚙️ [ADMIN] POST /admin/backup');
    
    try {
      const result = await this.adminService.createDatabaseBackup();
      console.log('✅ Database backup created successfully:', { filename: result.filename, size: result.size });
      return result;
    } catch (error) {
      console.log('❌ Database backup creation failed:', error.message);
      throw error;
    }
  }

  @Post('restore')
  @ApiOperation({ 
    summary: 'Restaurar backup de base de datos',
    description: 'Restaura la base de datos desde un archivo de backup'
  })
  @ApiResponse({ status: 200, description: 'Base de datos restaurada exitosamente' })
  async restoreBackup(@Body() restoreData: { backupData: string; format: 'sql' | 'json' }) {
    console.log('\n⚙️ [ADMIN] POST /admin/restore');
    console.log('📥 Body:', { format: restoreData.format, hasBackupData: !!restoreData.backupData });
    
    try {
      if (!restoreData.backupData) {
        throw new BadRequestException('Datos de backup requeridos');
      }
      
      const result = await this.adminService.restoreDatabaseBackup(restoreData.backupData, restoreData.format);
      console.log('✅ Database restore completed successfully:', { format: restoreData.format });
      return result;
    } catch (error) {
      console.log('❌ Database restore failed:', error.message);
      throw error;
    }
  }

  @Post('rotate-secrets')
  @ApiOperation({ 
    summary: 'Rotar secretos del sistema',
    description: 'Rota JWT_SECRET y otras claves sensibles'
  })
  @ApiResponse({ status: 200, description: 'Secretos rotados exitosamente' })
  async rotateSecrets() {
    console.log('\n⚙️ [ADMIN] POST /admin/rotate-secrets');
    
    try {
      const result = await this.adminService.rotateSystemSecrets();
      console.log('✅ System secrets rotated successfully');
      return result;
    } catch (error) {
      console.log('❌ System secrets rotation failed:', error.message);
      throw error;
    }
  }
}