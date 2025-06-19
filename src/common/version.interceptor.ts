import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class VersionInterceptor implements NestInterceptor {
  private readonly SUPPORTED_VERSIONS = ['1', '1.0', '1.1'];
  private readonly DEFAULT_VERSION = '1';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Obtener versión de headers o URL
    let version = request.headers['accept-version'] || 
                  request.headers['api-version'] ||
                  request.query.version ||
                  this.DEFAULT_VERSION;

    // Validar versión soportada
    if (!this.SUPPORTED_VERSIONS.includes(version)) {
      throw new BadRequestException(
        `API version ${version} not supported. Supported versions: ${this.SUPPORTED_VERSIONS.join(', ')}`
      );
    }

    // Agregar versión al request para uso en controladores
    request.apiVersion = version;

    // Agregar header de respuesta
    response.setHeader('API-Version', version);
    response.setHeader('Supported-Versions', this.SUPPORTED_VERSIONS.join(', '));

    return next.handle().pipe(
      map(data => {
        // Envolver respuesta con metadatos de versión
        if (data && typeof data === 'object' && !data.apiVersion) {
          return {
            ...data,
            _meta: {
              ...data._meta,
              apiVersion: version,
              timestamp: new Date().toISOString()
            }
          };
        }
        return data;
      })
    );
  }
}