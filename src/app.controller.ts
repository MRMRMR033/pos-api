import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator';
import { 
  ApiTags, 
  ApiOperation, 
  ApiOkResponse,
  ApiResponse 
} from '@nestjs/swagger';

@ApiTags('Sistema')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ 
    summary: 'Health Check - Verificar estado del servidor',
    description: `
      Endpoint público para verificar que el servidor esté funcionando correctamente.
      No requiere autenticación.
      
      **Uso común:**
      - Monitoreo de servicios
      - Load balancer health checks
      - Verificación rápida de conectividad
    `
  })
  @ApiOkResponse({
    description: 'Servidor funcionando correctamente',
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Respuesta exitosa del servidor',
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
