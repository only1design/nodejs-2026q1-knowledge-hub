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
import { ApiResponse } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CommentQueryDto } from './dto/comment-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Comment created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 422, description: 'Reference is not exist' })
  create(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Comment found' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.commentService.findOne(id);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Comment list found' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  findAll(@Query() query: CommentQueryDto) {
    return this.commentService.findAll(query);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Comment deleted' })
  @ApiResponse({ status: 400, description: 'Invalid UUID' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.commentService.remove(id);
  }
}
