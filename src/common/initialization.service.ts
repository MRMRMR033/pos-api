import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { seedPermissions } from '../auth/permissions.seed';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InitializationService {
  private readonly logger = new Logger(InitializationService.name);

  constructor(private prisma: PrismaService) {}

  async initializeApplication() {
    this.logger.log('🚀 Iniciando configuración inicial de la aplicación...');

    try {
      // 1. Seed de permisos
      await this.seedPermissions();

      // 2. Crear usuario admin por defecto
      await this.createDefaultAdmin();

      this.logger.log('✅ Configuración inicial completada exitosamente');
    } catch (error) {
      this.logger.error('❌ Error durante la configuración inicial:', error);
      throw error;
    }
  }

  private async seedPermissions() {
    this.logger.log('📋 Inicializando permisos del sistema...');
    
    try {
      await seedPermissions();
      this.logger.log('✅ Permisos inicializados correctamente');
    } catch (error) {
      this.logger.error('❌ Error al inicializar permisos:', error);
      throw error;
    }
  }

  private async createDefaultAdmin() {
    this.logger.log('👤 Verificando usuario administrador por defecto...');

    try {
      // Verificar si ya existe un usuario admin
      const existingAdmin = await this.prisma.usuario.findFirst({
        where: { rol: 'admin' }
      });

      if (existingAdmin) {
        this.logger.log('ℹ️ Ya existe un usuario administrador, omitiendo creación');
        return;
      }

      // Hash de la contraseña por defecto
      const saltRounds = 10;
      const defaultPassword = '12345';
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

      // Crear usuario admin
      const adminUser = await this.prisma.usuario.create({
        data: {
          fullName: 'Administrador del Sistema',
          email: 'admin@pos-system.com',
          password: hashedPassword,
          rol: 'admin',
        }
      });

      this.logger.log(`✅ Usuario administrador creado exitosamente:`);
      this.logger.log(`   📧 Email: ${adminUser.email}`);
      this.logger.log(`   🔑 Contraseña: ${defaultPassword}`);
      this.logger.log(`   🆔 ID: ${adminUser.id}`);
      
      // IMPORTANTE: Log de seguridad
      this.logger.warn('⚠️  IMPORTANTE: Cambia la contraseña del administrador en producción');

    } catch (error) {
      this.logger.error('❌ Error al crear usuario administrador:', error);
      throw error;
    }
  }

  // Método para verificar si la aplicación ya fue inicializada
  async isApplicationInitialized(): Promise<boolean> {
    try {
      // Verificar si existen permisos y usuarios admin
      const [permissionsCount, adminCount] = await Promise.all([
        this.prisma.permission.count(),
        this.prisma.usuario.count({ where: { rol: 'admin' } })
      ]);

      return permissionsCount > 0 && adminCount > 0;
    } catch (error) {
      this.logger.error('❌ Error al verificar estado de inicialización:', error);
      return false;
    }
  }

  // Método para mostrar información del sistema en startup
  async logSystemInfo() {
    try {
      const [usersCount, permissionsCount, adminCount] = await Promise.all([
        this.prisma.usuario.count(),
        this.prisma.permission.count(),
        this.prisma.usuario.count({ where: { rol: 'admin' } })
      ]);

      this.logger.log('📊 Estado del sistema:');
      this.logger.log(`   👥 Usuarios: ${usersCount}`);
      this.logger.log(`   👑 Administradores: ${adminCount}`);
      this.logger.log(`   🔐 Permisos configurados: ${permissionsCount}`);

      if (adminCount === 0) {
        this.logger.warn('⚠️  No hay usuarios administradores en el sistema');
      }

    } catch (error) {
      this.logger.error('❌ Error al obtener información del sistema:', error);
    }
  }
}