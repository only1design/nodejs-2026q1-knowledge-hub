import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CommentService } from '../comment/comment.service';
import { ArticleFilter, ArticleRepository } from './article.repository';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    @Inject(forwardRef(() => CommentService))
    private readonly commentService: CommentService,
  ) {}

  async create(createArticleDto: CreateArticleDto) {
    const now = BigInt(Date.now());

    return await this.articleRepository.create({
      ...createArticleDto,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  async findAll(query?: ArticleFilter) {
    return await this.articleRepository.findAll(query);
  }

  async findOne(id: Article['id']) {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  async update(id: Article['id'], updateArticleDto: UpdateArticleDto) {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    article.updatedAt = BigInt(Date.now());

    return await this.articleRepository.update(id, updateArticleDto);
  }

  async remove(id: Article['id']) {
    if (!(await this.articleRepository.delete(id))) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    (await this.commentService.findAll({ articleId: id })).forEach(
      (comment) => {
        this.commentService.remove(comment.id);
      },
    );
  }

  async exist(id: Article['id']) {
    return Boolean(await this.articleRepository.findById(id));
  }
}
