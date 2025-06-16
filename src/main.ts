// src/main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/rol.guard';
import { PermissionsGuard } from './auth/permissions.guard';
import { PermissionsService } from './auth/permissions.service';
import { InitializationService } from './common/initialization.service';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🚀 INICIALIZACIÓN DE LA APLICACIÓN
  const initializationService = app.get(InitializationService);
  
  try {
    // Verificar si la aplicación ya fue inicializada
    const isInitialized = await initializationService.isApplicationInitialized();
    
    if (!isInitialized) {
      console.log('🔧 Primera ejecución detectada, inicializando sistema...');
      await initializationService.initializeApplication();
    } else {
      console.log('✅ Sistema ya inicializado');
      await initializationService.logSystemInfo();
    }
  } catch (error) {
    console.error('❌ Error durante la inicialización del sistema:', error);
    process.exit(1); // Salir si falla la inicialización
  }

  // Configuración de Swagger
  const options = new DocumentBuilder()
    .setTitle('API de Gestión de Ventas')
    .setDescription('API para gestionar usuarios, tickets y productos')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
      
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  const reflector = app.get(Reflector);
  const permissionsService = app.get(PermissionsService);
  app.useGlobalGuards(
    new JwtAuthGuard(reflector),    // ◀ aquí pasamos reflector
    new RolesGuard(reflector),
    new PermissionsGuard(reflector, permissionsService),
  );

  console.log('🚀 Servidor iniciado en el puerto 3000');
  console.log('📚 Documentación disponible en: http://localhost:3000/api');
  await app.listen(3000);
}
bootstrap();
