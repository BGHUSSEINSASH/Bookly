import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T> | T> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiEnvelope<T> | T> {
    const handler = next.handle();
    const isStream = context.getType() !== 'http';
    if (isStream) return handler;

    return handler.pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'success' in (data as any)) {
          return data;
        }
        const isPaginated =
          data && typeof data === 'object' && 'items' in (data as any) && 'total' in (data as any);
        const envelope: ApiEnvelope<any> = {
          success: true,
          data: isPaginated ? data : data,
          timestamp: new Date().toISOString(),
        };
        if (isPaginated) {
          envelope.meta = {
            total: (data as any).total,
            page: (data as any).page,
            limit: (data as any).limit,
            pages: (data as any).pages,
          };
        }
        return envelope;
      }),
    );
  }
}
