import { BaseRepository } from '../common/base.repository';
import { Comment } from './entities/comment.entity';

export abstract class CommentRepository extends BaseRepository<Comment> {}
