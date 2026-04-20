import { forwardRef, Module } from '@nestjs/common';
import { CommentModule } from '../comment/comment.module';
import { ArticleDbRepository } from './article-db.repository';
import { ArticleRepository } from './article.repository';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';

@Module({
  controllers: [ArticleController],
  providers: [
    ArticleService,
    {
      provide: ArticleRepository,
      useClass: ArticleDbRepository,
    },
  ],
  exports: [ArticleService],
  imports: [forwardRef(() => CommentModule)],
})
export class ArticleModule {}
