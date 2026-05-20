import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ArticleService } from '../article/article.service';
import { Article } from '../article/entities/article.entity';
import { ServiceUnavailableError } from '../common/errors/app.errors';
import { AnalyzeArticleDto } from './dto/analyze-article.dto';
import { GenerateDto } from './dto/generate.dto';
import { SummarizeArticleDto } from './dto/summarize-article.dto';
import { TranslateArticleDto } from './dto/translate-article.dto';
import { aiUsageInterceptor } from './interceptors/ai-usage.interceptor';
import { GeminiService } from './gemini/gemini.service';
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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private cacheHits = 0;
  private cacheMisses = 0;

  getUsageStats() {
    return {
      usage: aiUsageInterceptor.getUsage(),
      totalRequests: aiUsageInterceptor.getTotalRequest(),
      tokenUsage: this.geminiService.getTokenUsage(),
      cache: {
        hits: this.cacheHits,
        misses: this.cacheMisses,
        hitRate:
          this.cacheHits + this.cacheMisses > 0
            ? +(this.cacheHits / (this.cacheHits + this.cacheMisses)).toFixed(2)
            : 0,
      },
      latency: this.geminiService.getLatencyStats(),
      errors: this.geminiService.getErrorStats(),
    };
  }

  private async withCache<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const cached = await this.cacheManager.get<T>(key);
    if (cached) {
      this.cacheHits++;
      return cached;
    }

    this.cacheMisses++;
    const result = await fn();
    await this.cacheManager.set(key, result);
    return result;
  }

  async summarizeArticle(
    articleId: Article['id'],
    summarizeArticleDto: SummarizeArticleDto,
  ) {
    const article = await this.articleService.findOne(articleId);
    const cacheKey = `${AiService.name}:${this.summarizeArticle.name}:${articleId}:${JSON.stringify(summarizeArticleDto)}:${article.updatedAt}`;

    return this.withCache(cacheKey, async () => {
      const content = await this.geminiService.generateContent(
        summarizeArticlePrompt(article, summarizeArticleDto.maxLength),
      );

      return {
        articleId,
        summary: content.text,
        originalLength: article.content.length,
        summaryLength: content.text.length,
      };
    });
  }

  async translateArticle(
    articleId: Article['id'],
    translateArticleDto: TranslateArticleDto,
  ) {
    const article = await this.articleService.findOne(articleId);
    const cacheKey = `${AiService.name}:${this.translateArticle.name}:${articleId}:${JSON.stringify(translateArticleDto)}:${article.updatedAt}`;

    return this.withCache(cacheKey, async () => {
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
    });
  }

  async analyzeArticle(
    articleId: Article['id'],
    analyzeArticleDto: AnalyzeArticleDto,
  ) {
    const article = await this.articleService.findOne(articleId);
    const cacheKey = `${AiService.name}:${this.analyzeArticle.name}:${articleId}:${JSON.stringify(analyzeArticleDto)}:${article.updatedAt}`;

    return this.withCache(cacheKey, async () => {
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
    });
  }

  async sendChatMessage(sessionId: string, generateDto: GenerateDto) {
    const response = await this.geminiService.sendChatMessage(
      sessionId,
      generateDto.prompt,
    );

    return response.text;
  }
}
