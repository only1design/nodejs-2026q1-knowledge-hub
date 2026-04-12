import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ArticleService } from '../article/article.service';
import { Article } from '../article/entities/article.entity';
import { User } from '../user/entities/user.entity';
import { CommentRepository } from './comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    @Inject(forwardRef(() => ArticleService))
    private readonly articleService: ArticleService,
  ) {}

  create(createCommentDto: CreateCommentDto) {
    if (!this.articleService.exist(createCommentDto.articleId)) {
      throw new HttpException(
        'Article is not exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return this.commentRepository.create({
      ...createCommentDto,
      id: randomUUID(),
      createdAt: Date.now(),
    });
  }

  findOne(id: Comment['id']) {
    const comment = this.commentRepository.findById(id);

    if (!comment) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    return comment;
  }

  findAll(filters?: { articleId?: Article['id']; authorId?: User['id'] }) {
    let comments = this.commentRepository.findAll();

    if (filters.articleId) {
      comments = comments.filter(
        (comment) => comment.articleId === filters.articleId,
      );
    }

    if (filters.authorId) {
      comments = comments.filter(
        (comment) => comment.authorId === filters.authorId,
      );
    }

    return comments;
  }

  remove(id: Comment['id']) {
    if (!this.commentRepository.delete(id)) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
  }
}
