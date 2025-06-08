import {
    Controller,
    Post,
    Body,
    UsePipes,
    ValidationPipe,
    UseGuards,
    Get,
    Req,
  } from '@nestjs/common';
  import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
  } from '@nestjs/swagger';
  import { AuthService } from './auth.service';
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';
  import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';
  
  @ApiTags('Auth')
  @Controller('auth')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  export class AuthController {
    constructor(private readonly auth: AuthService) {}
  
    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Registrar un nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario registrado' })
    async register(@Body() dto: RegisterDto) {
      return this.auth.register(dto);
    }
  
    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login de usuario' })
    @ApiResponse({
      status: 200,
      description: 'Token de acceso',
      schema: { example: { access_token: 'eyJ...' } },
    })
    async login(@Body() dto: LoginDto) {
      return this.auth.login(dto);
    }
  
    @Get('perfil')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Perfil del usuario autenticado' })
    @ApiResponse({ status: 200, description: 'Datos del usuario' })
    async profile(@Req() req: any) {
      return req.user;
    }
  }
  