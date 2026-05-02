import 'dotenv/config';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { load } from 'js-yaml';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { appConfig } from './app.constants';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './errors/all-exceptions.filter';
import { FileRotationLogger } from './logger/file-rotation.logger';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

async function bootstrap() {
  const logger = new FileRotationLogger({
    logLevels: [appConfig.logLevel],
    json: appConfig.isProd,
    maxFileSizeKB: appConfig.logMaxFileSize,
  });

  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());

  const document = load(readFileSync(path.resolve('doc/api.yaml'), 'utf8'));
  SwaggerModule.setup('doc', app, document);

  await app.listen(process.env.PORT || 4000);

  process.on('uncaughtException', async (error) => {
    logger.fatal('Uncaught exception', error.stack);
    await app.close();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason) => {
    logger.error(
      'Unhandled rejection',
      reason instanceof Error ? reason.stack : String(reason),
    );
    await app.close();
    process.exit(1);
  });
}

bootstrap();
