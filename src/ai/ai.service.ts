import { Injectable, Logger } from '@nestjs/common';
import { ArticleService } from '../article/article.service';
import { Article } from '../article/entities/article.entity';
import { ServiceUnavailableError } from '../errors/app.errors';
import { AnalyzeArticleDto } from './dto/analyze-article.dto';
import { GenerateDto } from './dto/generate.dto';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { TranslateArticleDto } from './dto/translate-article.dto';
import { GeminiService } from './gemini.service';
import { analyzeArticlePrompt } from './prompts/analyze-article.prompt';
import { summarizeArticlePrompt } from './prompts/summarize-article.prompt';
import { translateArticlePrompt } from './prompts/translate-article.prompt';
import {
  analyzeArticleJsonSchema,
  analyzeArticleSchema,
} from './schemas/analyze-article.schema';
import {
  translatedArticleJsonSchema,
  translatedArticleSchema,
} from './schemas/translate-article.schema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly articleService: ArticleService,
  ) {}

  async summarizeArticle(
    articleId: Article['id'],
    summarizeArticleDto: SummarizeArticleDto,
  ) {
    const article = await this.articleService.findOne(articleId);

    const content = await this.geminiService.generateContent(
      summarizeArticlePrompt(article, summarizeArticleDto.maxLength),
    );

    return {
      articleId,
      summary: content.text,
      originalLength: article.content.length,
      summaryLength: content.text.length,
    };
  }

  async translateArticle(
    articleId: Article['id'],
    translateArticleDto: TranslateArticleDto,
  ) {
    const article = await this.articleService.findOne(articleId);

    const content = await this.geminiService.generateContent(
      translateArticlePrompt(
        article,
        translateArticleDto.targetLanguage,
        translateArticleDto.sourceLanguage,
      ),
      {
        responseMimeType: 'application/json',
        responseJsonSchema: translatedArticleJsonSchema,
      },
    );

    try {
      const translatedArticle = translatedArticleSchema.parse(
        JSON.parse(content.text),
      );

      return {
        articleId,
        translatedText: translatedArticle.translatedText,
        detectedLanguage: translatedArticle.detectedLanguage,
      };
    } catch (e) {
      this.logger.error(e);

      throw new ServiceUnavailableError(
        'AI service returned an invalid response',
      );
    }
  }

  async analyzeArticle(
    articleId: Article['id'],
    analyzeArticleDto: AnalyzeArticleDto,
  ) {
    const article = await this.articleService.findOne(articleId);

    const content = await this.geminiService.generateContent(
      analyzeArticlePrompt(article, analyzeArticleDto.task),
      {
        responseMimeType: 'application/json',
        responseJsonSchema: analyzeArticleJsonSchema,
      },
    );

    try {
      const analyzedArticle = analyzeArticleSchema.parse(
        JSON.parse(content.text),
      );

      return {
        articleId,
        analysis: analyzedArticle.analysis,
        suggestions: analyzedArticle.suggestions,
        severity: analyzedArticle.severity,
      };
    } catch (e) {
      this.logger.error(e);

      throw new ServiceUnavailableError(
        'AI service returned an invalid response',
      );
    }
  }

  async generate(generateDto: GenerateDto) {
    const content = await this.geminiService.generateContent(
      generateDto.prompt,
    );

    return content.text;
  }
}
