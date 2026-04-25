import { LogLevel } from '@nestjs/common';

export const appConfig = {
  logLevel: (process.env.LOG_LEVEL as LogLevel) || 'log',
  isProd: process.env.NODE_ENV === 'production',
};
