import { Module } from '@nestjs/common';
import { ArticleModule } from '../article/article.module';
import { CategoryDbRepository } from './category-db.repository';
import { CategoryRepository } from './category.repository';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';

@Module({
  controllers: [CategoryController],
  providers: [
    CategoryService,
    {
      provide: CategoryRepository,
      useClass: CategoryDbRepository,
    },
  ],
  exports: [CategoryService],
  imports: [ArticleModule],
})
export class CategoryModule {}
