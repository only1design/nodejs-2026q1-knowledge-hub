import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ArticleModule } from '../article/article.module';
import { aiConfig } from './ai.constants';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GeminiService } from './gemini.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: aiConfig.cacheTtl,
    }),
    ArticleModule,
  ],
  controllers: [AiController],
  providers: [AiService, GeminiService],
})
export class AiModule {}
