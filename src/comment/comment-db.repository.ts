import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { DbBaseRepository } from '../common/base-db.repository';
import { PrismaService } from '../prisma/prisma.service';
import { Comment } from './entities/comment.entity';
import { CommentRepository } from './comment.repository';

@Injectable()
export class CommentDbRepository
  extends DbBaseRepository<Comment>
  implements CommentRepository
{
  constructor(prisma: PrismaService) {
    super(prisma, Prisma.ModelName.Comment, Comment);
  }
}
