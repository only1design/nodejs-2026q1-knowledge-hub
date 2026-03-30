import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';

@Module({
  imports: [UserModule, ArticleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
