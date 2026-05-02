import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ThrottlerLimitDetail } from '@nestjs/throttler/dist/throttler.guard.interface';

@Injectable()
export class AiThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const res = context.switchToHttp().getResponse();
    const ttlSeconds = Math.ceil(throttlerLimitDetail.ttl / 1000);
    res.header('Retry-After', String(ttlSeconds));
    res.status(HttpStatus.TOO_MANY_REQUESTS);

    throw new ThrottlerException();
  }
}
