import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { randomUUID } from 'node:crypto';
import { Prisma } from '../../../generated/prisma/client';
import { DbBaseRepository } from '../../common/repository/base-db.repository';
import { ArticleFilter, ArticleRepository } from './article.repository';
import { Article } from '../entities/article.entity';

@Injectable()
export class ArticleDbRepository
  extends DbBaseRepository<Article>
  implements ArticleRepository
{
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, Prisma.ModelName.Article, Article);
  }

  private tagsToConnectOrCreate(tags: string[]) {
    return (tags ?? []).map((name) => ({
      where: { name },
      create: { id: randomUUID(), name },
    }));
  }

  private toArticleEntity(data: any): Article {
    const entity = this.toEntity(data);
    entity.tags = (data.tags ?? []).map((tag: any) => tag.name);
    return entity;
  }

  async create(entity: Article): Promise<Article> {
    const { tags, ...rest } = entity;
    return this.toArticleEntity(
      await this.model.create({
        data: {
          ...rest,
          tags: { connectOrCreate: this.tagsToConnectOrCreate(tags) },
        },
        include: { tags: true },
      }),
    );
  }

  async update(
    id: string,
    data: Partial<Article>,
  ): Promise<Article | undefined> {
    const { tags, ...rest } = data;
    return this.toArticleEntity(
      await this.model.update({
        where: { id },
        data: {
          ...rest,
          ...(tags !== undefined && {
            tags: {
              set: [],
              connectOrCreate: this.tagsToConnectOrCreate(tags),
            },
          }),
        },
        include: { tags: true },
      }),
    );
  }

  async findAll(filter?: ArticleFilter): Promise<Article[]> {
    const where: any = {};

    if (filter?.status) where.status = filter.status;
    if (filter?.categoryId) where.categoryId = filter.categoryId;
    if (filter?.authorId) where.authorId = filter.authorId;
    if (filter?.tag) where.tags = { some: { name: filter.tag } };
    if (filter?.ids?.length) where.id = { in: filter.ids };

    const results = await this.model.findMany({
      where,
      include: { tags: true },
    });
    return results.map((r: any) => this.toArticleEntity(r));
  }

  async findById(id: string): Promise<Article | undefined> {
    const result = await this.model.findFirst({
      where: { id },
      include: { tags: true },
    });
    return result ? this.toArticleEntity(result) : undefined;
  }
}
