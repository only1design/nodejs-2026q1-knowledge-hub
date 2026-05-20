import { forwardRef, Module } from '@nestjs/common';
import { ArticleModule } from '../article/article.module';
import { CommentDbRepository } from './repository/comment-db.repository';
import { CommentRepository } from './repository/comment.repository';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

@Module({
  controllers: [CommentController],
  providers: [
    CommentService,
    {
      provide: CommentRepository,
      useClass: CommentDbRepository,
    },
  ],
  exports: [CommentService],
  imports: [forwardRef(() => ArticleModule)],
})
export class CommentModule {}
