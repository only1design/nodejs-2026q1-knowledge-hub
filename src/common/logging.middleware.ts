import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
]);

function sanitize(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = SENSITIVE_KEYS.has(key) ? '[REDACTED]' : sanitize(value);
  }
  return result;
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, query, body } = req;
    const start = Date.now();

    const logParts = [`Incoming ${method} ${originalUrl}`];

    if (Object.keys(query).length) {
      logParts.push(`query=${JSON.stringify(query)}`);
    }
    if (body && Object.keys(body).length) {
      logParts.push(`body=${JSON.stringify(sanitize(body))}`);
    }

    this.logger.log(logParts.join(' '));

    res.on('finish', () => {
      this.logger.log(
        `Response ${method} ${originalUrl} ${res.statusCode} ${Date.now() - start}ms`,
      );
    });

    next();
  }
}
