import { forwardRef, Module } from '@nestjs/common';
import { CommentModule } from '../comment/comment.module';
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
  imports: [forwardRef(() => CommentModule)],
})
export class ArticleModule {}
