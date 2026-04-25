import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { NotFoundError, ValidationError } from '../errors/app.errors';
import { randomUUID } from 'node:crypto';
import { ArticleService } from '../article/article.service';
import { CommentFilter, CommentRepository } from './comment.repository';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    @Inject(forwardRef(() => ArticleService))
    private readonly articleService: ArticleService,
  ) {}

  async create(createCommentDto: CreateCommentDto) {
    if (!(await this.articleService.exist(createCommentDto.articleId))) {
      throw new ValidationError('Article is not exist');
    }

    return await this.commentRepository.create({
      ...createCommentDto,
      id: randomUUID(),
      createdAt: BigInt(Date.now()),
    });
  }

  async findOne(id: Comment['id']) {
    const comment = await this.commentRepository.findById(id);

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    return comment;
  }

  async findAll(filters?: CommentFilter) {
    return await this.commentRepository.findAll(filters);
  }

  async remove(id: Comment['id']) {
    if (!(await this.commentRepository.delete(id))) {
      throw new NotFoundError('Comment not found');
    }
  }
}
