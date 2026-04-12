import { forwardRef, Module } from '@nestjs/common';
import { ArticleModule } from '../article/article.module';
import { InMemoryCommentRepository } from './comment-memory.repository';
import { CommentRepository } from './comment.repository';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

@Module({
  controllers: [CommentController],
  providers: [
    CommentService,
    {
      provide: CommentRepository,
      useClass: InMemoryCommentRepository,
    },
  ],
  exports: [CommentService],
  imports: [forwardRef(() => ArticleModule)],
})
export class CommentModule {}
