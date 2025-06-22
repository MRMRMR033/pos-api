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
  
  // 🌐 CONFIGURACIÓN CORS - Permitir conexiones desde Tauri
  app.enableCors({
    origin: [
      'http://localhost:1420',      // Tauri dev server
      'https://tauri.localhost',    // Tauri prod
      'tauri://localhost',          // Tauri custom protocol
      'http://localhost:3000',      // Dev
      'http://localhost:5173',      // Vite dev
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'API-Version', 
      'Accept-Version',
      'X-Requested-With',
      'Origin'
    ],
    credentials: true,
  });
  
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

  // Configuración avanzada de Swagger
  const config = new DocumentBuilder()
    .setTitle('POS API - Sistema de Punto de Venta')
    .setDescription(`
      ## 🏪 API RESTful para Sistema de Punto de Venta

      Esta API proporciona un conjunto completo de endpoints para gestionar:
      - **Autenticación y autorización** con JWT y permisos granulares
      - **Gestión de productos** con categorías y proveedores
      - **Sistema de ventas** con tickets e items
      - **Control de inventario** con movimientos de stock
      - **Gestión de usuarios** con roles y permisos personalizables
      - **Movimientos de caja** y eventos de sesión
      
      ### 🔐 Autenticación
      La API utiliza **JWT Bearer tokens** para autenticación. 
      
      ### 👤 Usuario por Defecto
      - **Email:** admin@pos-system.com
      - **Password:** 12345
      - **Rol:** admin (todos los permisos)
      
      ### 🔑 Sistema de Permisos
      - **Admins:** Acceso completo automático
      - **Empleados:** Permisos granulares customizables
      - **40+ permisos específicos** por módulo
      
      ### 📱 Entornos
      - **Desarrollo:** http://localhost:3000
      - **Documentación:** http://localhost:3000/api
    `)
    .setVersion('1.0.0')
    .setContact(
      'Equipo de Desarrollo',
      'https://github.com/MRMRMR033/pos-api',
      'admin@pos-system.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Servidor de Desarrollo')
    .addServer('https://api.pos-system.com', 'Servidor de Producción')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu JWT token obtenido del endpoint /auth/login',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Auth', 'Autenticación y gestión de sesiones')
    .addTag('Usuarios', 'Gestión de usuarios y permisos')
    .addTag('Productos', 'Gestión de productos e inventario')
    .addTag('Categorías', 'Gestión de categorías de productos')
    .addTag('Proveedores', 'Gestión de proveedores')
    .addTag('Ventas', 'Sistema de ventas y tickets')
    .addTag('Items de Ticket', 'Gestión de items individuales de tickets')
    .addTag('Caja', 'Movimientos de caja y dinero')
    .addTag('Sesiones', 'Eventos de login/logout de usuarios')
    .addTag('Sistema', 'Endpoints del sistema y salud')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'POS API - Documentación',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });
      
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
