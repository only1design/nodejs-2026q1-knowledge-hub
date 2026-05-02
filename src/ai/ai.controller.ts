import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/auth.decorators';
import { JwtPayloadDto } from '../auth/dto/jwt-payload.dto';
import { AiThrottlerGuard } from './ai-throttler.guard';
import { aiUsageInterceptor } from './ai-usage.interceptor';
import { aiConfig } from './ai.constants';
import { AiService } from './ai.service';
import { AnalyzeArticleDto } from './dto/analyze-article.dto';
import { GenerateDto } from './dto/generate.dto';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { Article } from 'src/article/entities/article.entity';
import { TranslateArticleDto } from './dto/translate-article.dto';

@UseGuards(AiThrottlerGuard)
@Throttle({ default: { ttl: 60_000, limit: aiConfig.rateLimit } })
@UseInterceptors(aiUsageInterceptor)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('usage')
  @SkipThrottle()
  getUsage() {
    return this.aiService.getUsageStats();
  }

  @Post('articles/:articleId/summarize')
  @HttpCode(200)
  async summarizeArticle(
    @Param('articleId', new ParseUUIDPipe({ version: '4' }))
    articleId: Article['id'],
    @Body() summarizeArticleDto: SummarizeArticleDto,
  ) {
    return await this.aiService.summarizeArticle(
      articleId,
      summarizeArticleDto,
    );
  }

  @Post('articles/:articleId/translate')
  @HttpCode(200)
  async translateArticle(
    @Param('articleId', new ParseUUIDPipe({ version: '4' }))
    articleId: Article['id'],
    @Body() translateArticleDto: TranslateArticleDto,
  ) {
    return await this.aiService.translateArticle(
      articleId,
      translateArticleDto,
    );
  }

  @Post('articles/:articleId/analyze')
  @HttpCode(200)
  async analyseArticle(
    @Param('articleId', new ParseUUIDPipe({ version: '4' }))
    articleId: Article['id'],
    @Body() analyzeArticleDto: AnalyzeArticleDto,
  ) {
    return await this.aiService.analyzeArticle(articleId, analyzeArticleDto);
  }

  @Post('generate')
  @HttpCode(200)
  async generate(
    @Body() generateDto: GenerateDto,
    @CurrentUser() currentUser: JwtPayloadDto,
  ) {
    return await this.aiService.generate(currentUser.userId, generateDto);
  }
}
