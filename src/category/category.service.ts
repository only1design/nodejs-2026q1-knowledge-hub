import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ArticleService } from '../article/article.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly articleService: ArticleService,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    return this.categoryRepository.create({
      ...createCategoryDto,
      id: randomUUID(),
    });
  }

  findAll() {
    return this.categoryRepository.findAll();
  }

  findOne(id: Category['id']) {
    const category = this.categoryRepository.findById(id);

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    return category;
  }

  update(id: Category['id'], updateCategoryDto: UpdateCategoryDto) {
    const category = this.categoryRepository.findById(id);

    if (!category) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    return this.categoryRepository.update(id, updateCategoryDto);
  }

  remove(id: Category['id']) {
    if (!this.categoryRepository.delete(id)) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    this.articleService.findAll({ categoryId: id }).forEach((article) => {
      this.articleService.update(article.id, { categoryId: null });
    });
  }
}
