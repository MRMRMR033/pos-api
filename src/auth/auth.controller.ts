import {
    Controller,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Get,
    Req,
    Param,
    ParseIntPipe,
    ForbiddenException,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiParam,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiCreatedResponse,
    ApiOkResponse,
  } from '@nestjs/swagger';
  import { AuthService } from './auth.service';
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';
  import { GrantPermissionDto } from './dto/grant-permission.dto';
  import { RevokePermissionDto } from './dto/revoke-permission.dto';
  import { JwtAuthGuard } from './jwt-auth.guard';
  import { PermissionsService } from './permissions.service';
import { Public } from './public.decorator';
  import { RequirePermission } from './permissions.decorator';
  import { PERMISSIONS } from './permissions.constants';
  import { 
    LoginResponseDto, 
    UserProfileResponseDto, 
    PermissionDto,
    UserPermissionsResponseDto,
    AllPermissionsResponseDto,
    PermissionActionResponseDto
  } from './dto/auth-response.dto';
  import { ErrorResponseDto } from '../common/dto/api-response.dto';
  
  @ApiTags('Auth')
  @Controller('auth')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  export class AuthController {
    constructor(
      private readonly auth: AuthService,
      private readonly permissionsService: PermissionsService,
    ) {}
  
    @Public()
    @Post('register')
    @ApiOperation({ 
      summary: 'Registrar un nuevo usuario en el sistema',
      description: `
        Crea una nueva cuenta de usuario en el sistema POS.
        El usuario se crea con rol de empleado por defecto y permisos básicos.
        
        **Nota:** Este endpoint está público para el registro inicial.
      `
    })
    @ApiBody({ 
      type: RegisterDto,
      description: 'Datos para crear el nuevo usuario',
      examples: {
        empleado: {
          summary: 'Registro de empleado',
          description: 'Ejemplo de registro de un empleado',
          value: {
            fullName: 'Juan Pérez',
            email: 'juan.perez@empresa.com',
            password: 'password123',
            rol: 'empleado'
          }
        },
        admin: {
          summary: 'Registro de administrador',
          description: 'Ejemplo de registro de un administrador',
          value: {
            fullName: 'María García',
            email: 'maria.garcia@empresa.com',
            password: 'admin123',
            rol: 'admin'
          }
        }
      }
    })
    @ApiCreatedResponse({ 
      description: 'Usuario registrado exitosamente',
      type: UserProfileResponseDto,
      example: {
        id: 3,
        fullName: 'Juan Pérez',
        email: 'juan.perez@empresa.com',
        rol: 'empleado',
        createdAt: '2025-06-16T10:30:00.000Z',
        updatedAt: '2025-06-16T10:30:00.000Z'
      }
    })
    @ApiBadRequestResponse({ 
      description: 'Datos de entrada inválidos',
      type: ErrorResponseDto,
      example: {
        statusCode: 400,
        timestamp: '2025-06-16T10:30:00.000Z',
        path: '/auth/register',
        message: ['El email debe ser válido', 'La contraseña debe tener al menos 6 caracteres'],
        error: 'Bad Request'
      }
    })
    async register(@Body() dto: RegisterDto) {
      console.log('\n🔐 [AUTH] POST /auth/register');
      console.log('📥 Request body:', { ...dto, password: '[HIDDEN]' });
      
      try {
        const result = await this.auth.register(dto);
        console.log('📤 Response:', { ...result, password: '[HIDDEN]' });
        console.log('✅ Registration successful');
        return result;
      } catch (error) {
        console.log('❌ Registration failed:', error.message);
        throw error;
      }
    }
  
    @Public()
    @Post('login')
    @ApiOperation({ 
      summary: 'Iniciar sesión en el sistema',
      description: `
        Autentica al usuario y devuelve un JWT token para acceder a endpoints protegidos.
        
        ### Credenciales por defecto:
        - **Admin:** admin@pos-system.com / 12345
        
        El token tiene una duración de 1 hora y debe incluirse en el header Authorization 
        como "Bearer {token}" para acceder a endpoints protegidos.
      `
    })
    @ApiBody({ 
      type: LoginDto,
      description: 'Credenciales de acceso',
      examples: {
        admin: {
          summary: 'Login como administrador',
          description: 'Credenciales del administrador por defecto',
          value: {
            email: 'admin@pos-system.com',
            password: '12345'
          }
        },
        empleado: {
          summary: 'Login como empleado',
          description: 'Ejemplo de login de empleado',
          value: {
            email: 'empleado@empresa.com',
            password: 'password123'
          }
        }
      }
    })
    @ApiOkResponse({
      description: 'Login exitoso - Tokens JWT y de refresco generados',
      type: LoginResponseDto,
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AcG9zLXN5c3RlbS5jb20iLCJmdWxsTmFtZSI6IkFkbWluaXN0cmFkb3IgZGVsIFNpc3RlbWEiLCJpYXQiOjE3NTAwNzM1NTUsImV4cCI6MTc1MDA3NzE1NX0.wDbzMfzfnRAFGcbYHOCKSAs_JUltwLEDsw0MyhfRDSU',
        refresh_token: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01234567',
        expires_in: 900
      }
    })
    @ApiUnauthorizedResponse({
      description: 'Credenciales inválidas',
      type: ErrorResponseDto,
      example: {
        statusCode: 401,
        timestamp: '2025-06-16T10:30:00.000Z',
        path: '/auth/login',
        message: 'Credenciales inválidas',
        error: 'Unauthorized'
      }
    })
    @ApiBadRequestResponse({
      description: 'Datos de entrada inválidos',
      type: ErrorResponseDto,
      example: {
        statusCode: 400,
        timestamp: '2025-06-16T10:30:00.000Z',
        path: '/auth/login',
        message: ['El email es requerido', 'La contraseña es requerida'],
        error: 'Bad Request'
      }
    })
    async login(@Body() dto: LoginDto, @Req() req: any) {
      console.log('\n🔐 [AUTH] POST /auth/login');
      console.log('📥 Request body:', { email: dto.email, password: '[HIDDEN]' });
      
      try {
        // Extract device info and IP address
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
        const ipAddress = req.ip || req.connection?.remoteAddress || 'Unknown IP';
        
        const result = await this.auth.login(dto, deviceInfo, ipAddress);
        console.log('📤 Response:', { 
          access_token: result.access_token ? '[TOKEN_GENERATED]' : 'null',
          refresh_token: result.refresh_token ? '[REFRESH_TOKEN_GENERATED]' : 'null',
          expires_in: result.expires_in
        });
        console.log('✅ Login successful');
        return result;
      } catch (error) {
        console.log('❌ Login failed:', error.message);
        throw error;
      }
    }
  
    @Get('perfil')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
      summary: 'Obtener perfil del usuario autenticado',
      description: `
        Retorna la información del perfil del usuario que está autenticado actualmente.
        Requiere un token JWT válido en el header Authorization.
      `
    })
    @ApiOkResponse({
      description: 'Perfil del usuario obtenido exitosamente',
      type: UserProfileResponseDto,
      example: {
        id: 2,
        email: 'admin@pos-system.com',
        fullName: 'Administrador del Sistema',
        rol: 'admin',
        createdAt: '2025-06-16T04:35:02.872Z',
        updatedAt: '2025-06-16T04:35:02.872Z'
      }
    })
    @ApiUnauthorizedResponse({
      description: 'Token JWT inválido o expirado',
      type: ErrorResponseDto,
      example: {
        statusCode: 401,
        timestamp: '2025-06-16T10:30:00.000Z',
        path: '/auth/perfil',
        message: 'Unauthorized',
        error: 'Unauthorized'
      }
    })
    async profile(@Req() req: any) {
      console.log('\n🔐 [AUTH] GET /auth/perfil');
      console.log('📥 Authenticated user ID:', req.user?.id);
      
      try {
        const result = req.user;
        console.log('📤 Response:', { id: result.id, email: result.email, rol: result.rol });
        console.log('✅ Profile retrieved successfully');
        return result;
      } catch (error) {
        console.log('❌ Profile retrieval failed:', error.message);
        throw error;
      }
    }

    @Public()
    @Post('refresh')
    @ApiOperation({ 
      summary: 'Renovar token de acceso usando refresh token',
      description: `
        Genera un nuevo access token usando un refresh token válido.
        Los refresh tokens tienen una duración de 7 días y rotan automáticamente.
      `
    })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          refresh_token: {
            type: 'string',
            description: 'Refresh token válido'
          }
        },
        required: ['refresh_token']
      }
    })
    @ApiOkResponse({
      description: 'Token renovado exitosamente',
      schema: {
        type: 'object',
        properties: {
          access_token: { type: 'string' },
          refresh_token: { type: 'string' },
          expires_in: { type: 'number' }
        }
      }
    })
    async refreshToken(@Body() body: { refresh_token: string }) {
      console.log('\n🔐 [AUTH] POST /auth/refresh');
      console.log('📥 Request body: [REFRESH_TOKEN_PROVIDED]');
      
      try {
        const result = await this.auth.refreshToken(body.refresh_token);
        console.log('📤 Response:', { 
          access_token: '[NEW_TOKEN_GENERATED]',
          refresh_token: '[NEW_REFRESH_TOKEN_GENERATED]',
          expires_in: result.expires_in
        });
        console.log('✅ Token refreshed successfully');
        return result;
      } catch (error) {
        console.log('❌ Token refresh failed:', error.message);
        throw error;
      }
    }

    @Public()
    @Post('logout')
    @ApiOperation({ 
      summary: 'Cerrar sesión usando refresh token',
      description: `
        Invalida la sesión actual usando el refresh token.
        El token ya no podrá ser usado para renovar access tokens.
      `
    })
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          refresh_token: {
            type: 'string',
            description: 'Refresh token de la sesión a cerrar'
          }
        },
        required: ['refresh_token']
      }
    })
    @ApiOkResponse({ description: 'Sesión cerrada exitosamente' })
    async logout(@Body() body: { refresh_token: string }) {
      console.log('\n🔐 [AUTH] POST /auth/logout');
      console.log('📥 Request body: [REFRESH_TOKEN_PROVIDED]');
      
      try {
        await this.auth.logout(body.refresh_token);
        console.log('✅ Logout successful');
        return { message: 'Sesión cerrada exitosamente' };
      } catch (error) {
        console.log('❌ Logout failed:', error.message);
        throw error;
      }
    }

    @Post('logout-all')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
      summary: 'Cerrar todas las sesiones del usuario',
      description: 'Invalida todas las sesiones activas del usuario autenticado'
    })
    @ApiOkResponse({ description: 'Todas las sesiones cerradas exitosamente' })
    async logoutAll(@Req() req: any) {
      console.log('\n🔐 [AUTH] POST /auth/logout-all');
      console.log('📥 User ID:', req.user?.id);
      
      try {
        await this.auth.logoutAllSessions(req.user.id);
        console.log('✅ All sessions logged out successfully');
        return { message: 'Todas las sesiones cerradas exitosamente' };
      } catch (error) {
        console.log('❌ Logout all failed:', error.message);
        throw error;
      }
    }

    // =============== ENDPOINTS DE GESTIÓN DE PERMISOS ===============

    @Get('permissions/all')
    @RequirePermission(PERMISSIONS.USUARIOS_GESTIONAR_PERMISOS)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ 
      summary: 'Obtener todos los permisos disponibles en el sistema',
      description: `
        Retorna la lista completa de permisos disponibles en el sistema POS.
        Útil para gestión de permisos y asignación a usuarios.
        
        **Permiso requerido:** usuarios:gestionar_permisos
      `
    })
    @ApiOkResponse({
      description: 'Lista de permisos obtenida exitosamente',
      schema: {
        type: 'array',
        items: { $ref: '#/components/schemas/PermissionDto' },
        example: [
          {
            id: 1,
            key: 'productos:ver',
            name: 'Ver productos',
            description: 'Ver productos',
            module: 'productos'
          },
          {
            id: 2,
            key: 'productos:ver_precio_costo',
            name: 'Ver precio de costo de productos',
            description: 'Ver precio de costo de productos',
            module: 'productos'
          },
          {
            id: 3,
            key: 'ventas:crear',
            name: 'Crear ventas',
            description: 'Crear ventas',
            module: 'ventas'
          }
        ]
      }
    })
    @ApiUnauthorizedResponse({
      description: 'Token JWT inválido o expirado',
      type: ErrorResponseDto
    })
    @ApiForbiddenResponse({
      description: 'Sin permisos para gestionar permisos',
      type: ErrorResponseDto,
      example: {
        statusCode: 403,
        timestamp: '2025-06-16T10:30:00.000Z',
        path: '/auth/permissions/all',
        message: 'No tienes permisos suficientes. Permisos requeridos (al menos uno): usuarios:gestionar_permisos',
        error: 'Forbidden'
      }
    })
    async getAllPermissions() {
      console.log('\n🔐 [AUTH] GET /auth/permissions/all');
      
      try {
        const result = await this.permissionsService.getAllPermissions();
        console.log('📤 Response: Found', result.length, 'permissions');
        console.log('✅ All permissions retrieved successfully');
        return result;
      } catch (error) {
        console.log('❌ Failed to get all permissions:', error.message);
        throw error;
      }
    }

    @Get('permissions/user/:id')
    @RequirePermission(PERMISSIONS.USUARIOS_VER_TODOS, PERMISSIONS.USUARIOS_VER_PROPIO)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener permisos de un usuario específico' })
    @ApiResponse({ status: 200, description: 'Lista de permisos del usuario' })
    async getUserPermissions(@Param('id', ParseIntPipe) userId: number, @Req() req: any) {
      console.log('\n🔐 [AUTH] GET /auth/permissions/user/:id');
      console.log('📥 Params:', { userId });
      console.log('📥 Current user:', req.user?.id);
      
      try {
        // Verificar si el usuario puede ver solo sus propios permisos
        const currentUser = req.user;
        const canViewAll = await this.permissionsService.hasPermission(currentUser.id, PERMISSIONS.USUARIOS_VER_TODOS);
        
        if (!canViewAll && currentUser.id !== userId) {
          throw new ForbiddenException('Solo puedes ver tus propios permisos');
        }

        const result = await this.permissionsService.getUserPermissions(userId);
        console.log('📤 Response: Found', result.length, 'permissions for user', userId);
        console.log('✅ User permissions retrieved successfully');
        return result;
      } catch (error) {
        console.log('❌ Failed to get user permissions:', error.message);
        throw error;
      }
    }

    @Post('permissions/grant')
    @RequirePermission(PERMISSIONS.USUARIOS_GESTIONAR_PERMISOS)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Otorgar permiso a un usuario' })
    @ApiResponse({ status: 201, description: 'Permiso otorgado exitosamente' })
    async grantPermission(@Body() dto: GrantPermissionDto, @Req() req: any) {
      console.log('\n🔐 [AUTH] POST /auth/permissions/grant');
      console.log('📥 Request body:', dto);
      console.log('📥 Granted by user:', req.user?.id);
      
      try {
        const grantedById = req.user.id;
        const result = await this.permissionsService.grantPermission(
          dto.userId, 
          dto.permissionKey, 
          grantedById
        );
        console.log('📤 Response:', result);
        console.log('✅ Permission granted successfully');
        return result;
      } catch (error) {
        console.log('❌ Failed to grant permission:', error.message);
        throw error;
      }
    }

    @Post('permissions/revoke')
    @RequirePermission(PERMISSIONS.USUARIOS_GESTIONAR_PERMISOS)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Revocar permiso a un usuario' })
    @ApiResponse({ status: 200, description: 'Permiso revocado exitosamente' })
    async revokePermission(@Body() dto: RevokePermissionDto) {
      console.log('\n🔐 [AUTH] POST /auth/permissions/revoke');
      console.log('📥 Request body:', dto);
      
      try {
        const result = await this.permissionsService.revokePermission(dto.userId, dto.permissionKey);
        console.log('📤 Response:', result);
        console.log('✅ Permission revoked successfully');
        return result;
      } catch (error) {
        console.log('❌ Failed to revoke permission:', error.message);
        throw error;
      }
    }
  }
  