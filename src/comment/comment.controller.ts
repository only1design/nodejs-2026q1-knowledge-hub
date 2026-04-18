import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserRole } from '../../generated/prisma/enums';
import { Role } from '../auth/role.decorator';
import { paginate } from '../common/paginate';
import { CommentService } from './comment.service';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Role(UserRole.admin)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Role(UserRole.editor)
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    return await this.commentService.create(createCommentDto);
  }

  @Role(UserRole.viewer)
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.commentService.findOne(id);
  }

  @Role(UserRole.viewer)
  @Get()
  async findAll(@Query() query: CommentQueryDto) {
    return paginate(await this.commentService.findAll(query), query);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return await this.commentService.remove(id);
  }
}
