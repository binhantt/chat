import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class PublicRoleInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(map((data: unknown) => hideRoleField(data)));
  }
}

function hideRoleField(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => hideRoleField(item));
  }

  if (!data || typeof data !== 'object' || data instanceof Date) {
    return data;
  }

  const source = data as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(source)) {
    if (key === 'role') {
      continue;
    }

    output[key] = hideRoleField(value);
  }

  return output;
}
