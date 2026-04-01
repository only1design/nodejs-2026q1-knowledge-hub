import { Injectable } from '@nestjs/common';
import { InMemoryBaseRepository } from '../common/base-memory.repository';
import { CommentRepository } from './comment.repository';
import { Comment } from './entities/comment.entity';

@Injectable()
export class InMemoryCommentRepository
  extends InMemoryBaseRepository<Comment>
  implements CommentRepository
{
  constructor() {
    super(Comment);
  }
}
