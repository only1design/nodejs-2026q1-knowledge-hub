import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
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
      throw new HttpException(
        'Article is not exist',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
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
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }

    return comment;
  }

  async findAll(filters?: CommentFilter) {
    return await this.commentRepository.findAll(filters);
  }

  async remove(id: Comment['id']) {
    if (!(await this.commentRepository.delete(id))) {
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    }
  }
}
