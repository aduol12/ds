import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * Wraps successful responses as { success, data } unless already shaped.
 * Keeps arrays/objects used by the existing portal (kits, readings) unwrapped
 * when TRANSFORM_RESPONSES=false (default) for backward compatibility.
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const wrap = process.env.TRANSFORM_RESPONSES === 'true';
    if (!wrap) {
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'success' in (data as Record<string, unknown>)
        ) {
          return data;
        }
        return { success: true, data };
      }),
    );
  }
}
