import { Module } from '@nestjs/common';
import { InMemoryArticleRepository } from './article-memory.repository';
import { ArticleRepository } from './article.repository';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';

@Module({
  controllers: [ArticleController],
  providers: [
    ArticleService,
    {
      provide: ArticleRepository,
      useClass: InMemoryArticleRepository,
    },
  ],
  exports: [ArticleService],
})
export class ArticleModule {}
