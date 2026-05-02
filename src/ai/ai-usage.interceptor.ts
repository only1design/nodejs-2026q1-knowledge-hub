import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

class AiUsageInterceptor implements NestInterceptor {
  private usage = new Map<string, number>();
  private totalRequests = 0;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handlerName = context.getHandler().name;

    if (handlerName === 'getUsage') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        this.usage.set(handlerName, (this.usage.get(handlerName) ?? 0) + 1);
        this.totalRequests++;
      }),
    );
  }

  getUsage(): Record<string, number> {
    return Object.fromEntries(this.usage);
  }

  getTotalRequest(): number {
    return this.totalRequests;
  }
}

export const aiUsageInterceptor = new AiUsageInterceptor();
