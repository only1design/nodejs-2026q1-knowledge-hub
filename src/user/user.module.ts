import { Module } from '@nestjs/common';
import { ArticleModule } from '../article/article.module';
import { CommentModule } from '../comment/comment.module';
import { DbUserRepository } from './user-db.repository';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    { provide: UserRepository, useClass: DbUserRepository },
  ],
  exports: [UserService],
  imports: [ArticleModule, CommentModule],
})
export class UserModule {}
