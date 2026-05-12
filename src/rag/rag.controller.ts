import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { RagChatDto } from './dto/rag-chat.dto';
import { RagSearchDto } from './dto/rag-search.dto';
import { ReindexDto } from './dto/reindex.dto';
import { RagService } from './rag.service';

@Controller('ai/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('index')
  @HttpCode(HttpStatus.OK)
  index(@Body() reindexDto: ReindexDto) {
    return this.ragService.index(reindexDto);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  search(@Body() ragSearchDto: RagSearchDto) {
    return this.ragService.search(ragSearchDto);
  }

  @Post('hybrid-search')
  @HttpCode(HttpStatus.OK)
  hybridSearch(@Body() ragSearchDto: RagSearchDto) {
    return this.ragService.hybridSearch(ragSearchDto);
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  chat(@Body() ragChatDto: RagChatDto) {
    return this.ragService.chat(ragChatDto);
  }

  @Delete('index/articles/:articleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteArticleFromIndex(
    @Param('articleId', new ParseUUIDPipe({ version: '4' }))
    articleId: string,
  ) {
    return this.ragService.deleteArticleFromIndex(articleId);
  }

  @Get('chat/:conversationId/history')
  getChatHistory(
    @Param('conversationId', new ParseUUIDPipe({ version: '4' }))
    conversationId: string,
  ) {
    return this.ragService.getChatHistory(conversationId);
  }
}
