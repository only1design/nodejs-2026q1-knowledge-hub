import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CommentService } from '../comment/comment.service';
import { ArticleRepository } from './article.repository';
import { ArticleQueryDto } from './dto/article-query.dto';
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

  create(createArticleDto: CreateArticleDto) {
    const now = Date.now();

    return this.articleRepository.create({
      ...createArticleDto,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  findAll(query?: ArticleQueryDto) {
    let articles = this.articleRepository.findAll();

    if (query.tag) {
      articles = articles.filter((article) => article.tags.includes(query.tag));
    }

    if (query.status) {
      articles = articles.filter((article) => article.status === query.status);
    }

    if (query.categoryId) {
      articles = articles.filter(
        (article) => article.categoryId === query.categoryId,
      );
    }

    return articles;
  }

  findOne(id: Article['id']) {
    const article = this.articleRepository.findById(id);

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  update(id: Article['id'], updateArticleDto: UpdateArticleDto) {
    const article = this.articleRepository.findById(id);

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    article.updatedAt = Date.now();

    return this.articleRepository.update(id, updateArticleDto);
  }

  remove(id: Article['id']) {
    if (!this.articleRepository.delete(id)) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    this.commentService.findAll({ articleId: id }).forEach((comment) => {
      this.commentService.remove(comment.id);
    });
  }

  exist(id: Article['id']): boolean {
    return Boolean(this.articleRepository.findById(id));
  }
}
