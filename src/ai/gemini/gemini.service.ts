import {
  ApiError,
  Chat,
  ContentListUnion,
  EmbedContentConfig,
  GenerateContentConfig,
  GenerateContentResponse,
  GoogleGenAI,
} from '@google/genai';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  InternalServiceError,
  ServiceUnavailableError,
} from '../../common/errors/app.errors';
import { aiConfig } from '../ai.constants';

@Injectable()
export class GeminiService {
  private ai = new GoogleGenAI({
    apiKey: aiConfig.gemini.apiKey,
    httpOptions: {
      timeout: 60_000,
    },
  });
  private logger = new Logger(GeminiService.name);
  private tokenUsage = {
    promptTokens: 0,
    candidatesTokens: 0,
  };
  private latencyMs: number[] = [];
  private errorCount = 0;
  private retryCount = 0;
  private chatSessions = new Map<string, Chat>();

  private getOrCreateChat(sessionId: string): Chat {
    let chat = this.chatSessions.get(sessionId);
    if (!chat) {
      chat = this.ai.chats.create({ model: aiConfig.gemini.model });
      this.chatSessions.set(sessionId, chat);
    }
    return chat;
  }

  getTokenUsage() {
    return {
      ...this.tokenUsage,
      totalTokens:
        this.tokenUsage.promptTokens + this.tokenUsage.candidatesTokens,
    };
  }

  getLatencyStats() {
    if (this.latencyMs.length === 0) {
      return { avg: 0, min: 0, max: 0, last: 0, count: 0 };
    }

    const sum = this.latencyMs.reduce((a, b) => a + b, 0);
    return {
      avg: Math.round(sum / this.latencyMs.length),
      min: Math.min(...this.latencyMs),
      max: Math.max(...this.latencyMs),
      last: this.latencyMs[this.latencyMs.length - 1],
      count: this.latencyMs.length,
    };
  }

  getErrorStats() {
    return {
      total: this.errorCount,
      retries: this.retryCount,
    };
  }

  async sendChatMessage(sessionId: string, message: string) {
    const chat = this.getOrCreateChat(sessionId);

    return this.execute(() => chat.sendMessage({ message }));
  }

  async generateContent(
    contents: ContentListUnion,
    config?: GenerateContentConfig,
  ) {
    return this.execute(() =>
      this.ai.models.generateContent({
        model: aiConfig.gemini.model,
        contents,
        config,
      }),
    );
  }

  async embedContent(contents: ContentListUnion, config: EmbedContentConfig) {
    return this.execute(() =>
      this.ai.models.embedContent({
        model: aiConfig.gemini.embeddingModel,
        contents,
        config,
      }),
    );
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    const start = Date.now();

    for (let attempt = 0; attempt <= aiConfig.maxRetries; attempt++) {
      try {
        const response = await fn();
        const hasMetadata =
          typeof response === 'object' && 'usageMetadata' in response;

        this.latencyMs.push(Date.now() - start);

        if (hasMetadata) {
          const meta =
            response.usageMetadata as GenerateContentResponse['usageMetadata'];
          if (meta) {
            this.tokenUsage.promptTokens += meta.promptTokenCount ?? 0;
            this.tokenUsage.candidatesTokens += meta.candidatesTokenCount ?? 0;
          }
        }

        return response;
      } catch (e) {
        if (e instanceof ApiError) {
          this.logger.error(
            `Gemini API error (status ${e.status}): ${e.message}`,
          );

          if (
            e.status === HttpStatus.UNAUTHORIZED ||
            e.status === HttpStatus.FORBIDDEN
          ) {
            this.errorCount++;
            throw new InternalServiceError('AI service configuration error');
          }

          if (
            e.status === HttpStatus.TOO_MANY_REQUESTS &&
            attempt < aiConfig.maxRetries
          ) {
            this.retryCount++;
            const delay = Math.pow(2, attempt) * 1000;
            this.logger.warn(
              `Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${aiConfig.maxRetries})`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        } else {
          this.logger.error('Unexpected Gemini error', e);
        }

        this.errorCount++;
        throw new ServiceUnavailableError(
          'AI service is temporarily unavailable',
        );
      }
    }
  }
}
