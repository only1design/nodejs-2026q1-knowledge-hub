import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { load } from 'js-yaml';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const document = load(readFileSync(path.resolve('doc/api.yaml'), 'utf8'));
  SwaggerModule.setup('doc', app, document);

  await app.listen(4000);
}
bootstrap();
