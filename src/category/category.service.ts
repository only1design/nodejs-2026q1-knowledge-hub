import { Transactional } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';
import { NotFoundError } from '../errors/app.errors';
import { randomUUID } from 'node:crypto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return await this.categoryRepository.create({
      ...createCategoryDto,
      id: randomUUID(),
    });
  }

  async findAll() {
    return await this.categoryRepository.findAll();
  }

  async findOne(id: Category['id']) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  @Transactional()
  async update(id: Category['id'], updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return await this.categoryRepository.update(id, updateCategoryDto);
  }

  async remove(id: Category['id']) {
    if (!(await this.categoryRepository.delete(id))) {
      throw new NotFoundError('Category not found');
    }
  }
}
