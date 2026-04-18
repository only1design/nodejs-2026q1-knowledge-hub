import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UserRole } from '../../generated/prisma/enums';
import { CurrentUser } from '../auth/auth.decorators';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { Role } from '../auth/role.decorator';
import { paginate } from '../common/paginate';
import { ArticleService } from './article.service';
import { ArticleQueryDto } from './dto/article-query.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Role(UserRole.admin)
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Role(UserRole.editor)
  @Post()
  async create(@Body() createArticleDto: CreateArticleDto) {
    return await this.articleService.create(createArticleDto);
  }

  @Role(UserRole.viewer)
  @Get()
  async findAll(@Query() query: ArticleQueryDto) {
    return paginate(await this.articleService.findAll(query), query);
  }

  @Role(UserRole.viewer)
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return await this.articleService.findOne(id);
  }

  @Role(UserRole.editor)
  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
    @CurrentUser() currentUser: JwtPayloadDto,
  ) {
    return await this.articleService.update(id, updateArticleDto, currentUser);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    await this.articleService.remove(id);
  }
}
