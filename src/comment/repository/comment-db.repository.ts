import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Prisma } from '../../../generated/prisma/client';
import { DbBaseRepository } from '../../common/repository/base-db.repository';
import { Comment } from '../entities/comment.entity';
import { CommentFilter, CommentRepository } from './comment.repository';

@Injectable()
export class CommentDbRepository
  extends DbBaseRepository<Comment>
  implements CommentRepository
{
  constructor(txHost: TransactionHost<TransactionalAdapterPrisma>) {
    super(txHost, Prisma.ModelName.Comment, Comment);
  }

  async findAll(filter?: CommentFilter): Promise<Comment[]> {
    const results = await this.model.findMany({
      where: filter,
    });

    return results.map((comment) => this.toEntity(comment));
  }
}
