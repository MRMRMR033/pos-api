import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: 'Indica si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo de la respuesta' })
  message: string;

  @ApiProperty({ description: 'Datos de respuesta' })
  data?: T;

  @ApiProperty({ description: 'Timestamp de la respuesta' })
  timestamp: string;

  @ApiProperty({ description: 'Código de estado HTTP' })
  statusCode: number;

  @ApiProperty({ description: 'Versión de la API', example: '1' })
  apiVersion?: string;

  @ApiProperty({ description: 'ID de request para tracking' })
  requestId?: string;
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Página actual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Elementos por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de elementos', example: 150 })
  total: number;

  @ApiProperty({ description: 'Total de páginas', example: 15 })
  totalPages: number;

  @ApiProperty({ description: 'Tiene página anterior', example: false })
  hasPreviousPage: boolean;

  @ApiProperty({ description: 'Tiene página siguiente', example: true })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Timestamp de la respuesta' })
  timestamp: string;

  @ApiProperty({ description: 'Versión de la API', example: '1' })
  apiVersion: string;
}

export class PaginatedResponseDto<T = any> {
  @ApiProperty({ description: 'Array de elementos' })
  data: T[];

  @ApiProperty({ description: 'Información de paginación' })
  meta: PaginationMetaDto;
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Código de estado HTTP', example: 400 })
  statusCode: number;

  @ApiProperty({ description: 'Timestamp del error' })
  timestamp: string;

  @ApiProperty({ description: 'Ruta donde ocurrió el error', example: '/auth/login' })
  path: string;

  @ApiProperty({ 
    description: 'Mensaje de error',
    oneOf: [
      { type: 'string', example: 'Credenciales inválidas' },
      { 
        type: 'array',
        items: { type: 'string' },
        example: ['El email debe ser válido', 'La contraseña es requerida']
      }
    ]
  })
  message: string | string[];

  @ApiProperty({ description: 'Tipo de error', example: 'ValidationError', required: false })
  error?: string;

  @ApiProperty({ description: 'Versión de la API', example: '1' })
  apiVersion?: string;

  @ApiProperty({ description: 'ID de request para tracking' })
  requestId?: string;
}