import { Module } from '@nestjs/common';
import { ArticleModule } from '../article/article.module';
import { InMemoryUserRepository } from './user-memory.repository';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    { provide: UserRepository, useClass: InMemoryUserRepository },
  ],
  exports: [UserService],
  imports: [ArticleModule],
})
export class UserModule {}
