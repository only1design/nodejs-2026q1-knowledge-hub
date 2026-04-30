import { Module } from '@nestjs/common';
import { ArticleModule } from '../article/article.module';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GeminiService } from './gemini.service';

@Module({
  imports: [ArticleModule],
  controllers: [AiController],
  providers: [AiService, GeminiService],
})
export class AiModule {}
