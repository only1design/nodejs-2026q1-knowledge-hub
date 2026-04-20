import { Transactional } from '@nestjs-cls/transactional';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UserRole } from '../../generated/prisma/enums';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { User } from '../user/entities/user.entity';
import { ArticleFilter, ArticleRepository } from './article.repository';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';

@Injectable()
export class ArticleService {
  constructor(private readonly articleRepository: ArticleRepository) {}

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

  @Transactional()
  async update(
    id: Article['id'],
    updateArticleDto: UpdateArticleDto,
    currentUser: JwtPayloadDto,
  ) {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }

    if (
      article.authorId !== currentUser.userId &&
      currentUser.role !== UserRole.admin
    ) {
      throw new HttpException(
        'You can only edit your own articles',
        HttpStatus.FORBIDDEN,
      );
    }

    article.updatedAt = BigInt(Date.now());

    return await this.articleRepository.update(id, updateArticleDto);
  }

  async remove(id: Article['id']) {
    if (!(await this.articleRepository.delete(id))) {
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
    }
  }

  async exist(id: Article['id']) {
    return Boolean(await this.articleRepository.findById(id));
  }
}
