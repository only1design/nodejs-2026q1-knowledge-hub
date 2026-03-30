import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [UserModule, ArticleModule, CategoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
